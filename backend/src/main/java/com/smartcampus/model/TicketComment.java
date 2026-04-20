package com.smartcampus.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_comments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TicketComment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Ticket ticket;

    @ManyToOne(optional = false)
    private User author;

    @Column(nullable = false, length = 1000)
    private String content;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
