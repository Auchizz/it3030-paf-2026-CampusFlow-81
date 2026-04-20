package com.smartcampus.service;

import com.smartcampus.exception.NotFoundException;
import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceType;
import com.smartcampus.payload.ResourceRequest;
import com.smartcampus.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResourceService {
    private final ResourceRepository resourceRepository;

    public List<Resource> getAll(ResourceType type, String location) {
        if (type != null) {
            return resourceRepository.findByType(type);
        }

        if (location != null && !location.isBlank()) {
            return resourceRepository.findByLocationContainingIgnoreCase(location);
        }

        return resourceRepository.findAll();
    }

    public Resource getOne(Long id) {
        return resourceRepository.findById(id).orElseThrow(() -> new NotFoundException("Resource not found"));
    }

    public Resource create(ResourceRequest request) {
        Resource resource = resourceRepository.save(Resource.builder()
                .name(request.getName().trim())
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation().trim())
                .status(request.getStatus())
                .description(normalizeDescription(request.getDescription()))
                .build());

        log.info("Resource created successfully: id={}, name={}, type={}",
                resource.getId(), resource.getName(), resource.getType());
        return resource;
    }

    public Resource update(Long id, ResourceRequest request) {
        Resource resource = getOne(id);
        resource.setName(request.getName().trim());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation().trim());
        resource.setStatus(request.getStatus());
        resource.setDescription(normalizeDescription(request.getDescription()));

        Resource updatedResource = resourceRepository.save(resource);
        log.info("Resource updated successfully: id={}, name={}, type={}",
                updatedResource.getId(), updatedResource.getName(), updatedResource.getType());
        return updatedResource;
    }

    public void delete(Long id) {
        Resource resource = getOne(id);
        resourceRepository.delete(resource);
        log.info("Resource deleted successfully: id={}, name={}", resource.getId(), resource.getName());
    }

    private String normalizeDescription(String description) {
        if (description == null || description.isBlank()) {
            return null;
        }

        return description.trim();
    }
}
