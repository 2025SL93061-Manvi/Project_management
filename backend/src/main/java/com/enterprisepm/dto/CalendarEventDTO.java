package com.enterprisepm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CalendarEventDTO {
    private Long id;
    private String title;
    private String date;         // ISO "yyyy-MM-dd"
    private String type;         // "MEETING" or "MILESTONE"
    private String projectName;
    private Long projectId;
    private String meetingLink;  // Google Meet URL, null for milestones
}
