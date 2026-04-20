package com.smartcampus.repository;

import com.smartcampus.model.Notification;
import com.smartcampus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientOrderByCreatedAtDesc(User user);
}
