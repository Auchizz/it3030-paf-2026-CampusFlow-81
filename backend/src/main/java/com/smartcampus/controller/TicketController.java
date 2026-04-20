package com.smartcampus.controller;

import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketComment;
import com.smartcampus.model.User;
import com.smartcampus.payload.*;
import com.smartcampus.service.TicketService;
import com.smartcampus.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {
    private final TicketService ticketService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Ticket>>> getAll(Authentication authentication) {
        User user = userService.getByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.<List<Ticket>>builder().success(true).message("Tickets fetched")
                .data(ticketService.getAll(user)).build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Ticket>> create(@Valid @RequestBody TicketRequest request, Authentication authentication) {
        User user = userService.getByEmail(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<Ticket>builder().success(true).message("Ticket created")
                        .data(ticketService.create(request, user)).build());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','TECHNICIAN')")
    public ResponseEntity<ApiResponse<Ticket>> updateStatus(@PathVariable Long id,
                                                            @Valid @RequestBody TicketStatusRequest request,
                                                            Authentication authentication) {
        User user = userService.getByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.<Ticket>builder().success(true).message("Ticket status updated")
                .data(ticketService.updateStatus(id, request, user)).build());
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Ticket>> assign(@PathVariable Long id, @Valid @RequestBody AssignTicketRequest request) {
        return ResponseEntity.ok(ApiResponse.<Ticket>builder().success(true).message("Ticket assigned")
                .data(ticketService.assign(id, request)).build());
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<List<TicketComment>>> comments(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<List<TicketComment>>builder().success(true).message("Comments fetched")
                .data(ticketService.getComments(id)).build());
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<TicketComment>> addComment(@PathVariable Long id,
                                                                 @Valid @RequestBody CommentRequest request,
                                                                 Authentication authentication) {
        User user = userService.getByEmail(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<TicketComment>builder().success(true).message("Comment added")
                        .data(ticketService.addComment(id, request, user)).build());
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId, Authentication authentication) {
        User user = userService.getByEmail(authentication.getName());
        ticketService.deleteComment(commentId, user);
        return ResponseEntity.noContent().build();
    }
}
