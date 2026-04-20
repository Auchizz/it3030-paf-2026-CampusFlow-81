package com.smartcampus.controller;

import com.smartcampus.model.Notification;
import com.smartcampus.model.User;
import com.smartcampus.payload.ApiResponse;
import com.smartcampus.service.NotificationService;
import com.smartcampus.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getAll(Authentication authentication) {
        User user = userService.getByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.<List<Notification>>builder().success(true)
                .message("Notifications fetched")
                .data(notificationService.getForUser(user)).build());
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Notification>> markRead(@PathVariable Long id, Authentication authentication) {
        User user = userService.getByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.<Notification>builder().success(true)
                .message("Notification marked as read")
                .data(notificationService.markRead(id, user)).build());
    }

    @PostMapping("/read-all")
    public ResponseEntity<ApiResponse<List<Notification>>> markAllRead(Authentication authentication) {
        User user = userService.getByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.<List<Notification>>builder().success(true)
                .message("All notifications marked as read")
                .data(notificationService.markAllRead(user)).build());
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<List<Notification>>> markAllReadLegacy(Authentication authentication) {
        User user = userService.getByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.<List<Notification>>builder().success(true)
                .message("All notifications marked as read")
                .data(notificationService.markAllRead(user)).build());
    }
}
