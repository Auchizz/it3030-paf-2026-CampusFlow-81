package com.smartcampus.service;

import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.NotFoundException;
import com.smartcampus.model.*;
import com.smartcampus.payload.BookingRequest;
import com.smartcampus.payload.BookingStatusRequest;
import com.smartcampus.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final BookingRepository bookingRepository;
    private final ResourceService resourceService;
    private final NotificationService notificationService;

    public List<Booking> getAll(User currentUser) {
        if (currentUser.getRole() == Role.ADMIN) {
            return bookingRepository.findAll();
        }
        return bookingRepository.findByRequestedBy(currentUser);
    }

    public Booking create(BookingRequest request, User currentUser) {
        if (request.getBookingDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Booking date cannot be in the past");
        }

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new BadRequestException("End time must be later than start time");
        }

        Resource resource = resourceService.getOne(request.getResourceId());
        if (resource.getStatus() == ResourceStatus.OUT_OF_SERVICE) {
            throw new BadRequestException("Selected resource is currently out of service");
        }

        if (request.getExpectedAttendees() > resource.getCapacity()) {
            throw new BadRequestException("Expected attendees exceed the selected resource capacity");
        }

        List<Booking> sameDayBookings = bookingRepository.findByResourceAndBookingDateAndStatusIn(
                resource,
                request.getBookingDate(),
                List.of(BookingStatus.PENDING, BookingStatus.APPROVED)
        );

        boolean conflict = sameDayBookings.stream().anyMatch(b ->
                request.getStartTime().isBefore(b.getEndTime()) && request.getEndTime().isAfter(b.getStartTime())
        );

        if (conflict) {
            throw new BadRequestException("Selected resource is already booked for that time range");
        }

        return bookingRepository.save(Booking.builder()
                .resource(resource)
                .requestedBy(currentUser)
                .bookingDate(request.getBookingDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose().trim())
                .expectedAttendees(request.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .build());
    }

    public Booking updateStatus(Long id, BookingStatusRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Booking not found"));

        if (request.getStatus() != BookingStatus.APPROVED && request.getStatus() != BookingStatus.REJECTED) {
            throw new BadRequestException("Only APPROVED or REJECTED allowed here");
        }

        booking.setStatus(request.getStatus());
        booking.setAdminReason(request.getReason());
        Booking saved = bookingRepository.save(booking);

        notificationService.notify(
                booking.getRequestedBy(),
                "Booking " + request.getStatus(),
                "Your booking for " + booking.getResource().getName() + " was " + request.getStatus() +
                        (request.getReason() != null ? ". Reason: " + request.getReason() : ""),
                NotificationType.BOOKING
        );
        return saved;
    }

    public Booking cancel(Long id, User currentUser) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Booking not found"));
        if (!booking.getRequestedBy().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ADMIN) {
            throw new BadRequestException("You cannot cancel this booking");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }
}
