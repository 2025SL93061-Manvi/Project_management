package com.enterprisepm.service;

import com.enterprisepm.dto.DashboardDTO;
import com.enterprisepm.dto.HolidayDTO;
import com.enterprisepm.dto.MilestoneDTO;
import com.enterprisepm.dto.MeetingDTO;
import com.enterprisepm.model.*;
import com.enterprisepm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final MilestoneRepository milestoneRepository;
    private final MeetingRepository meetingRepository;
    private final UserRepository userRepository;
    private final HolidayRepository holidayRepository;
    private final ProjectService projectService;
    private final TaskService taskService;

    public DashboardDTO getDashboard(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        DashboardDTO dashboard = new DashboardDTO();

        List<Project> myProjects;
        if (user.getRole() == Role.ADMIN) {
            myProjects = projectRepository.findAll();
        } else {
            List<Project> owned = projectRepository.findByOwner(user);
            List<Project> member = projectRepository.findByMembersContaining(user);
            owned.addAll(member);
            myProjects = owned.stream().distinct().collect(Collectors.toList());
        }

        dashboard.setTotalProjects(myProjects.size());
        dashboard.setActiveProjects((int) myProjects.stream()
                .filter(p -> p.getStatus() == ProjectStatus.ACTIVE).count());
        dashboard.setCompletedProjects((int) myProjects.stream()
                .filter(p -> p.getStatus() == ProjectStatus.COMPLETED).count());
        dashboard.setRecentProjects(myProjects.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5).map(projectService::toDTO).collect(Collectors.toList()));

        List<Task> myTasks = taskRepository.findByAssignedToOrAssigneesContaining(user);
        dashboard.setTotalTasks(myTasks.size());
        dashboard.setTasksTodo((int) myTasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.TODO).count());
        dashboard.setTasksInProgress((int) myTasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count());
        dashboard.setTasksDone((int) myTasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.DONE).count());
        dashboard.setMyTasks(myTasks.stream()
                .map(taskService::toDTO).collect(Collectors.toList()));

        LocalDate today = LocalDate.now();
        LocalDate in30Days = today.plusDays(30);
        List<MilestoneDTO> upcomingMilestones = myProjects.stream()
                .flatMap(p -> milestoneRepository.findByProjectId(p.getId()).stream())
                .filter(m -> !m.isCompleted()
                        && m.getDueDate() != null
                        && !m.getDueDate().isBefore(today)
                        && !m.getDueDate().isAfter(in30Days))
                .map(m -> {
                    MilestoneDTO dto = new MilestoneDTO();
                    dto.setId(m.getId());
                    dto.setTitle(m.getTitle());
                    dto.setDueDate(m.getDueDate());
                    dto.setCompleted(m.isCompleted());
                    dto.setProjectId(m.getProject().getId());
                    return dto;
                })
                .collect(Collectors.toList());
        dashboard.setUpcomingMilestones(upcomingMilestones);

        List<MeetingDTO> upcomingMeetings = myProjects.stream()
                .flatMap(p -> meetingRepository.findByProjectId(p.getId()).stream())
                .filter(m -> m.getMeetingDate() != null
                        && m.getMeetingDate().toLocalDate().isAfter(today.minusDays(1))
                        && m.getMeetingDate().toLocalDate().isBefore(today.plusDays(7)))
                .map(m -> {
                    MeetingDTO dto = new MeetingDTO();
                    dto.setId(m.getId());
                    dto.setTitle(m.getTitle());
                    dto.setMeetingDate(m.getMeetingDate());
                    dto.setLocation(m.getLocation());
                    dto.setProjectId(m.getProject().getId());
                    return dto;
                })
                .collect(Collectors.toList());
        dashboard.setUpcomingMeetings(upcomingMeetings);

        List<HolidayDTO> upcomingHolidays = holidayRepository.findAll().stream()
                .filter(h -> h.getHolidayDate() != null
                        && !h.getHolidayDate().isBefore(today)
                        && !h.getHolidayDate().isAfter(in30Days))
                .sorted((a, b) -> a.getHolidayDate().compareTo(b.getHolidayDate()))
                .map(h -> {
                    HolidayDTO dto = new HolidayDTO();
                    dto.setId(h.getId());
                    dto.setName(h.getName());
                    dto.setHolidayDate(h.getHolidayDate());
                    return dto;
                })
                .collect(Collectors.toList());
        dashboard.setUpcomingHolidays(upcomingHolidays);

        return dashboard;
    }
}
