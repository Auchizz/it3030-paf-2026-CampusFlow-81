package com.smartcampus.service;

import com.smartcampus.exception.NotFoundException;
import com.smartcampus.model.Notification;
import com.smartcampus.model.NotificationType;
import com.smartcampus.model.User;
import com.smartcampus.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public void notify(User user, String title, String message) {
        notify(user, title, message, inferType(title, message));
    }

    public void notify(User user, String title, String message, NotificationType type) {
        notificationRepository.save(Notification.builder()
                .recipient(user)
                .title(title)
                .message(message)
                .type(type == null ? NotificationType.GENERAL : type)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build());
    }

    public List<Notification> getForUser(User user) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user);
    }

    public Notification markRead(Long id, User user) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Notification not found"));
        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new NotFoundException("Notification not found for this user");
        }
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public List<Notification> markAllRead(User user) {
        List<Notification> unreadNotifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(user).stream()
                .filter(notification -> !notification.isRead())
                .peek(notification -> notification.setRead(true))
                .collect(Collectors.toList());

        if (unreadNotifications.isEmpty()) {
            return List.of();
        }

        return notificationRepository.saveAll(unreadNotifications);
    }

    private NotificationType inferType(String title, String message) {
        String content = ((title == null ? "" : title) + " " + (message == null ? "" : message)).toLowerCase();

        if (content.contains("booking")) {
            return NotificationType.BOOKING;
        }

        if (content.contains("ticket")) {
            return NotificationType.TICKET;
        }

        return NotificationType.GENERAL;
    }
}
