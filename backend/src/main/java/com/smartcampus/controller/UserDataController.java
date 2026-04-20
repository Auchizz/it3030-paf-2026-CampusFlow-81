package com.smartcampus.controller;

import com.smartcampus.model.Booking;
import com.smartcampus.model.Notification;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.User;
import com.smartcampus.payload.ApiResponse;
import com.smartcampus.service.BookingService;
import com.smartcampus.service.NotificationService;
import com.smartcampus.service.TicketService;
import com.smartcampus.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@PreAuthorize("hasRole('USER')")
@RequiredArgsConstructor
public class UserDataController {
    private final UserService userService;
    private final BookingService bookingService;
    private final TicketService ticketService;
    private final NotificationService notificationService;

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<Booking>>> bookings(Authentication authentication) {
        User user = userService.getByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.<List<Booking>>builder()
                .success(true)
                .message("User bookings fetched")
                .data(bookingService.getAll(user))
                .build());
    }

    @GetMapping("/tickets")
    public ResponseEntity<ApiResponse<List<Ticket>>> tickets(Authentication authentication) {
        User user = userService.getByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.<List<Ticket>>builder()
                .success(true)
                .message("User tickets fetched")
                .data(ticketService.getAll(user))
                .build());
    }

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<List<Notification>>> notifications(Authentication authentication) {
        User user = userService.getByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.<List<Notification>>builder()
                .success(true)
                .message("User notifications fetched")
                .data(notificationService.getForUser(user))
                .build());
    }
}
