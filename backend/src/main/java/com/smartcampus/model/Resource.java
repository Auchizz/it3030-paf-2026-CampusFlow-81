package com.smartcampus.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "resources")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Resource {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceType type;

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceStatus status;

    private String description;
}
