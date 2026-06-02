package com.enterprisepm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class MilestoneDTO {

    private Long id;

    @NotBlank
    private String title;

    private LocalDate dueDate;
    private boolean completed;

    @NotNull
    private Long projectId;

    private LocalDateTime createdAt;
}
