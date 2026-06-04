package com.enterprisepm.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ActivityLogDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String action;
    private String entityType;
    private Long entityId;
    private String entityName;
    private Long projectId;
    private String projectName;
    private LocalDateTime createdAt;
}
