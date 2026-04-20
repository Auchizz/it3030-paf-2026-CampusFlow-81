package com.smartcampus.controller;

import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceType;
import com.smartcampus.payload.ApiResponse;
import com.smartcampus.payload.ResourceRequest;
import com.smartcampus.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@Slf4j
public class ResourceController {
    private final ResourceService resourceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Resource>>> getAll(@RequestParam(required = false) ResourceType type,
                                                              @RequestParam(required = false) String location) {
        return ResponseEntity.ok(ApiResponse.<List<Resource>>builder().success(true).message("Resources fetched")
                .data(resourceService.getAll(type, location)).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Resource>> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<Resource>builder().success(true).message("Resource fetched")
                .data(resourceService.getOne(id)).build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Resource>> create(@Valid @RequestBody ResourceRequest request) {
        log.info("Create resource request received: name={}, type={}, location={}, status={}",
                request.getName(), request.getType(), request.getLocation(), request.getStatus());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<Resource>builder().success(true)
                .message("Resource created").data(resourceService.create(request)).build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Resource>> update(@PathVariable Long id, @Valid @RequestBody ResourceRequest request) {
        log.info("Update resource request received: id={}, name={}, type={}, location={}, status={}",
                id, request.getName(), request.getType(), request.getLocation(), request.getStatus());
        return ResponseEntity.ok(ApiResponse.<Resource>builder().success(true)
                .message("Resource updated").data(resourceService.update(id, request)).build());
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Resource>> patch(@PathVariable Long id, @Valid @RequestBody ResourceRequest request) {
        log.info("Patch resource request received: id={}, name={}, type={}, location={}, status={}",
                id, request.getName(), request.getType(), request.getLocation(), request.getStatus());
        return ResponseEntity.ok(ApiResponse.<Resource>builder().success(true)
                .message("Resource updated").data(resourceService.update(id, request)).build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("Delete resource request received: id={}", id);
        resourceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
