package com.enterprisepm.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProjectDTO {

    private Long id;

    @NotBlank
    private String name;

    private String description;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;

    private Long ownerId;
    private String ownerName;

    private List<Long> memberIds;
    private List<String> memberNames;
    private List<String> memberRoles;

    private int totalTasks;
    private int completedTasks;
    private int totalMilestones;

    private LocalDateTime createdAt;
}
