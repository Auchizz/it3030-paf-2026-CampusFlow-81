package com.smartcampus.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Ticket {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Resource resource;

    @ManyToOne(optional = false)
    private User createdBy;

    @ManyToOne
    private User assignedTo;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false, length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status;

    private String preferredContact;
    private String resolutionNotes;
    private String rejectionReason;
    private String attachment1;
    private String attachment2;
    private String attachment3;
}
