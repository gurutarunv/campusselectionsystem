package com.campusplacement.service.impl;

import com.campusplacement.dto.NotificationResponse;
import com.campusplacement.entity.Notification;
import com.campusplacement.entity.User;
import com.campusplacement.exception.ResourceNotFoundException;
import com.campusplacement.repository.NotificationRepository;
import com.campusplacement.repository.UserRepository;
import com.campusplacement.service.NotificationService;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Async
    @Transactional
    public void sendNotification(Long userId, String title, String message, String type) {
        userRepository.findById(userId).ifPresent(user -> {
            Notification notification = new Notification(user, title, message, type);
            notificationRepository.save(notification);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(n -> new NotificationResponse(n.getId(), n.getTitle(), n.getMessage(), n.getType(), n.isRead(), n.getCreatedAt()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, String email) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));

        if (notification.getUser().getEmail().equalsIgnoreCase(email)) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }
}
