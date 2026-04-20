package com.smartcampus.controller;

import com.smartcampus.model.Booking;
import com.smartcampus.model.User;
import com.smartcampus.payload.ApiResponse;
import com.smartcampus.payload.BookingRequest;
import com.smartcampus.payload.BookingStatusRequest;
import com.smartcampus.service.BookingService;
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
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {
    private final BookingService bookingService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Booking>>> getAll(Authentication authentication) {
        User user = userService.getByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.<List<Booking>>builder().success(true).message("Bookings fetched")
                .data(bookingService.getAll(user)).build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Booking>> create(@Valid @RequestBody BookingRequest request, Authentication authentication) {
        User user = userService.getByEmail(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<Booking>builder().success(true).message("Booking created")
                        .data(bookingService.create(request, user)).build());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Booking>> updateStatus(@PathVariable Long id, @Valid @RequestBody BookingStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.<Booking>builder().success(true).message("Booking status updated")
                .data(bookingService.updateStatus(id, request)).build());
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Booking>> cancel(@PathVariable Long id, Authentication authentication) {
        User user = userService.getByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.<Booking>builder().success(true).message("Booking cancelled")
                .data(bookingService.cancel(id, user)).build());
    }
}
