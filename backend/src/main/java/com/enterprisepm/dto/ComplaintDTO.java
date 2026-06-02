package com.enterprisepm.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ComplaintDTO {

    private Long id;

    @NotBlank
    private String title;

    private String description;
    private String type;
    private String status;

    private Long raisedById;
    private String raisedByName;

    private LocalDateTime createdAt;
}
