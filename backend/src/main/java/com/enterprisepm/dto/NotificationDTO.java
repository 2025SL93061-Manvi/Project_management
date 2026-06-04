package com.enterprisepm.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private Long id;
    private String title;
    private String message;
    private String type;
    private String entityType;
    private Long entityId;
    private String linkUrl;
    private boolean read;
    private LocalDateTime createdAt;
}
