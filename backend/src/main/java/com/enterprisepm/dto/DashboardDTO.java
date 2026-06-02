package com.enterprisepm.dto;

import lombok.Data;

import java.util.List;

@Data
public class DashboardDTO {

    private int totalProjects;
    private int activeProjects;
    private int completedProjects;

    private int totalTasks;
    private int tasksTodo;
    private int tasksInProgress;
    private int tasksDone;

    private List<ProjectDTO> recentProjects;
    private List<TaskDTO> myTasks;
    private List<MilestoneDTO> upcomingMilestones;
    private List<MeetingDTO> upcomingMeetings;
}
