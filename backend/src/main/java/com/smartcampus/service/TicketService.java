package com.smartcampus.service;

import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.NotFoundException;
import com.smartcampus.model.*;
import com.smartcampus.payload.*;
import com.smartcampus.repository.TicketCommentRepository;
import com.smartcampus.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TicketService {
    private static final Set<String> ALLOWED_CATEGORIES = Set.of(
            "Electrical",
            "Network",
            "Equipment",
            "Furniture",
            "Cleaning",
            "Safety",
            "Air Conditioning",
            "Other"
    );

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final ResourceService resourceService;
    private final UserService userService;
    private final NotificationService notificationService;

    public List<Ticket> getAll(User currentUser) {
        if (currentUser.getRole() == Role.ADMIN) return ticketRepository.findAll();
        if (currentUser.getRole() == Role.TECHNICIAN) return ticketRepository.findByAssignedTo(currentUser);
        return ticketRepository.findByCreatedBy(currentUser);
    }

    public Ticket create(TicketRequest request, User currentUser) {
        Resource resource = request.getResourceId() != null ? resourceService.getOne(request.getResourceId()) : null;
        String location = normalize(request.getLocation());
        String category = normalize(request.getCategory());
        String description = normalize(request.getDescription());
        String preferredContact = normalize(request.getPreferredContact());

        if (resource == null && location == null) {
            throw new BadRequestException("Provide a campus location or select a related resource");
        }

        if (location == null && resource != null) {
            location = resource.getLocation();
        }

        if (category == null || !ALLOWED_CATEGORIES.contains(category)) {
            throw new BadRequestException("Select a valid ticket category");
        }

        if (description == null) {
            throw new BadRequestException("Ticket description is required");
        }

        if (preferredContact == null) {
            throw new BadRequestException("Preferred contact is required");
        }

        if (request.getPriority() == TicketPriority.CRITICAL) {
            throw new BadRequestException("Use HIGH priority for urgent maintenance and incident tickets");
        }

        return ticketRepository.save(Ticket.builder()
                .resource(resource)
                .createdBy(currentUser)
                .assignedTo(null)
                .createdAt(LocalDateTime.now())
                .location(location)
                .category(category)
                .description(description)
                .priority(request.getPriority())
                .status(TicketStatus.OPEN)
                .preferredContact(preferredContact)
                .attachment1(normalize(request.getAttachment1()))
                .attachment2(normalize(request.getAttachment2()))
                .attachment3(normalize(request.getAttachment3()))
                .build());
    }

    public Ticket updateStatus(Long id, TicketStatusRequest request, User currentUser) {
        Ticket ticket = getOne(id);
        if (currentUser.getRole() == Role.USER || request.getStatus() == null) {
            throw new BadRequestException("Users cannot change ticket status");
        }

        TicketStatus nextStatus = request.getStatus();
        String resolutionNotes = normalize(request.getResolutionNotes());
        String rejectionReason = normalize(request.getRejectionReason());
        boolean canManageProgress = currentUser.getRole() == Role.ADMIN || isAssignedTo(ticket, currentUser);

        if (nextStatus == TicketStatus.OPEN) {
            throw new BadRequestException("Tickets cannot be moved back to OPEN");
        }

        if (nextStatus == TicketStatus.IN_PROGRESS) {
            if (!canManageProgress) {
                throw new BadRequestException("Only the assigned staff member or an admin can start work on this ticket");
            }
            if (ticket.getStatus() != TicketStatus.OPEN) {
                throw new BadRequestException("Only open tickets can be moved to IN_PROGRESS");
            }
            ticket.setRejectionReason(null);
        }

        if (nextStatus == TicketStatus.RESOLVED) {
            if (!canManageProgress) {
                throw new BadRequestException("Only the assigned staff member or an admin can resolve this ticket");
            }
            if (ticket.getStatus() != TicketStatus.OPEN && ticket.getStatus() != TicketStatus.IN_PROGRESS) {
                throw new BadRequestException("Only open or in-progress tickets can be resolved");
            }
            ticket.setResolutionNotes(resolutionNotes);
            ticket.setRejectionReason(null);
        }

        if (nextStatus == TicketStatus.REJECTED) {
            if (currentUser.getRole() != Role.ADMIN) {
                throw new BadRequestException("Only admins can reject tickets");
            }
            if (ticket.getStatus() != TicketStatus.OPEN && ticket.getStatus() != TicketStatus.IN_PROGRESS) {
                throw new BadRequestException("Only open or in-progress tickets can be rejected");
            }
            if (rejectionReason == null) {
                throw new BadRequestException("Provide a rejection reason before rejecting this ticket");
            }
            ticket.setRejectionReason(rejectionReason);
            ticket.setResolutionNotes(null);
        }

        if (nextStatus == TicketStatus.CLOSED) {
            if (currentUser.getRole() != Role.ADMIN) {
                throw new BadRequestException("Only admins can close tickets");
            }
            if (ticket.getStatus() != TicketStatus.RESOLVED) {
                throw new BadRequestException("Only resolved tickets can be closed");
            }
        }

        if (nextStatus != TicketStatus.RESOLVED && nextStatus != TicketStatus.REJECTED && resolutionNotes != null) {
            ticket.setResolutionNotes(resolutionNotes);
        }

        ticket.setStatus(nextStatus);
        Ticket saved = ticketRepository.save(ticket);
        notificationService.notify(ticket.getCreatedBy(), "Ticket status updated",
                "Ticket #" + ticket.getId() + " is now " + request.getStatus(), NotificationType.TICKET);
        return saved;
    }

    public Ticket assign(Long id, AssignTicketRequest request) {
        Ticket ticket = getOne(id);
        if (ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.REJECTED) {
            throw new BadRequestException("Closed or rejected tickets cannot be reassigned");
        }
        User technician = userService.getById(request.getTechnicianId());
        if (technician.getRole() != Role.TECHNICIAN && technician.getRole() != Role.ADMIN) {
            throw new BadRequestException("Assigned user must be a technician or admin");
        }
        ticket.setAssignedTo(technician);
        Ticket saved = ticketRepository.save(ticket);
        notificationService.notify(technician, "New ticket assigned",
                "Ticket #" + ticket.getId() + " has been assigned to you.", NotificationType.TICKET);
        return saved;
    }

    public TicketComment addComment(Long ticketId, CommentRequest request, User currentUser) {
        Ticket ticket = getOne(ticketId);
        TicketComment comment = commentRepository.save(TicketComment.builder()
                .ticket(ticket)
                .author(currentUser)
                .content(request.getContent())
                .createdAt(LocalDateTime.now())
                .build());
        notificationService.notify(ticket.getCreatedBy(), "New ticket comment",
                "A new comment was added to ticket #" + ticket.getId(), NotificationType.TICKET);
        return comment;
    }

    public void deleteComment(Long commentId, User currentUser) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException("Comment not found"));
        if (!comment.getAuthor().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ADMIN) {
            throw new BadRequestException("You cannot delete this comment");
        }
        commentRepository.delete(comment);
    }

    public List<TicketComment> getComments(Long ticketId) {
        Ticket ticket = getOne(ticketId);
        return commentRepository.findByTicketOrderByCreatedAtAsc(ticket);
    }

    public Ticket getOne(Long id) {
        return ticketRepository.findById(id).orElseThrow(() -> new NotFoundException("Ticket not found"));
    }

    private boolean isAssignedTo(Ticket ticket, User currentUser) {
        return ticket.getAssignedTo() != null && ticket.getAssignedTo().getId().equals(currentUser.getId());
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
