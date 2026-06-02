package com.enterprisepm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class TaskDTO {

    private Long id;

    @NotBlank
    private String title;

    private String description;
    private String status;
    private String priority;
    private LocalDate startDate;
    private LocalDate endDate;

    @NotNull
    private Long projectId;

    private Long assignedToId;
    private String assignedToName;

    private LocalDateTime createdAt;
}
