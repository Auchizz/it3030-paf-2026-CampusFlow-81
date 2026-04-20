package com.smartcampus.config;

import com.smartcampus.model.*;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            userRepository.save(User.builder().fullName("System Admin").email("admin@campus.com")
                    .password(passwordEncoder.encode("Admin@123")).role(Role.ADMIN).provider("LOCAL").build());
            userRepository.save(User.builder().fullName("Campus User").email("user@campus.com")
                    .password(passwordEncoder.encode("User@123")).role(Role.USER).provider("LOCAL").build());
            userRepository.save(User.builder().fullName("Tech Officer").email("tech@campus.com")
                    .password(passwordEncoder.encode("Tech@123")).role(Role.TECHNICIAN).provider("LOCAL").build());
        }
        if (resourceRepository.count() == 0) {
            resourceRepository.save(Resource.builder().name("A-101 Smart Lecture Hall").type(ResourceType.LECTURE_HALL)
                    .capacity(120).location("Main Building, Floor 1")
                    .status(ResourceStatus.ACTIVE).description("Large hall with smart board and audio system").build());
            resourceRepository.save(Resource.builder().name("Lab L-204").type(ResourceType.LAB)
                    .capacity(40).location("Engineering Block, Room 204")
                    .status(ResourceStatus.ACTIVE).description("Computer lab with high-performance PCs").build());
            resourceRepository.save(Resource.builder().name("4K Projector X1").type(ResourceType.EQUIPMENT)
                    .capacity(1).location("Media Center Storage")
                    .status(ResourceStatus.ACTIVE).description("Portable 4K projector for events and classes").build());
        }
    }
}
