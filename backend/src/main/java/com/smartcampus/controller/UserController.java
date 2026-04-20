package com.smartcampus.controller;

import com.smartcampus.payload.ApiResponse;
import com.smartcampus.payload.UserOptionResponse;
import com.smartcampus.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserOptionResponse>>> getAll() {
        List<UserOptionResponse> users = userService.getAllUsers().stream()
                .map(user -> UserOptionResponse.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .build())
                .toList();

        return ResponseEntity.ok(ApiResponse.<List<UserOptionResponse>>builder()
                .success(true)
                .message("Users fetched")
                .data(users)
                .build());
    }

    @GetMapping("/support-staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserOptionResponse>>> supportStaff() {
        List<UserOptionResponse> staff = userService.getSupportStaff().stream()
                .map(user -> UserOptionResponse.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .build())
                .toList();

        return ResponseEntity.ok(ApiResponse.<List<UserOptionResponse>>builder()
                .success(true)
                .message("Support staff fetched")
                .data(staff)
                .build());
    }
}
