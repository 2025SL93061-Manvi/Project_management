package com.enterprisepm.service;

import com.enterprisepm.dto.NotificationDTO;
import com.enterprisepm.model.Notification;
import com.enterprisepm.model.User;
import com.enterprisepm.repository.NotificationRepository;
import com.enterprisepm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Async
    public void notifyUser(Long recipientId, String title, String message,
                           String type, String entityType, Long entityId, String linkUrl) {
        User recipient = userRepository.findById(recipientId).orElse(null);
        if (recipient == null) return;
        Notification n = new Notification();
        n.setRecipient(recipient);
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type);
        n.setEntityType(entityType);
        n.setEntityId(entityId);
        n.setLinkUrl(linkUrl);
        notificationRepository.save(n);
    }

    public List<NotificationDTO> getForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user)
                .stream().limit(30).map(this::toDTO).collect(Collectors.toList());
    }

    public long countUnread(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.countByRecipientAndReadFalse(user);
    }

    public void markAllRead(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Notification> unread = notificationRepository.findByRecipientAndReadFalseOrderByCreatedAtDesc(user);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public void markRead(Long id, String email) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (n.getRecipient().getEmail().equals(email)) {
            n.setRead(true);
            notificationRepository.save(n);
        }
    }

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void deleteOldNotifications() {
        notificationRepository.deleteOlderThan(LocalDateTime.now().minusHours(24));
    }

    private NotificationDTO toDTO(Notification n) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(n.getId());
        dto.setTitle(n.getTitle());
        dto.setMessage(n.getMessage());
        dto.setType(n.getType());
        dto.setEntityType(n.getEntityType());
        dto.setEntityId(n.getEntityId());
        dto.setLinkUrl(n.getLinkUrl());
        dto.setRead(n.isRead());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }
}
