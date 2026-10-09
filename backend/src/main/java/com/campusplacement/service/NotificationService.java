package com.campusplacement.service;

import com.campusplacement.dto.NotificationResponse;
import java.util.List;

public interface NotificationService {
    void sendNotification(Long userId, String title, String message, String type);
    List<NotificationResponse> getUserNotifications(String email);
    void markAsRead(Long notificationId, String email);
}
