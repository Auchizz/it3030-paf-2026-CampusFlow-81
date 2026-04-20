package com.smartcampus.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private User recipient;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 800)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private NotificationType type;

    @Column(nullable = false)
    private boolean read;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
