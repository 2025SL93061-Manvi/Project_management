package com.enterprisepm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MeetingDTO {

    private Long id;

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private LocalDateTime meetingDate;

    private String location;

    private String meetingLink;

    private boolean addGoogleMeet;

    @NotNull
    private Long projectId;

    private Long organizerId;
    private String organizerName;

    private LocalDateTime createdAt;
}
