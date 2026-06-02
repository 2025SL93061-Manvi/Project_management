package com.enterprisepm.service;

import com.enterprisepm.model.Project;
import com.enterprisepm.model.Task;
import com.enterprisepm.model.TaskStatus;
import com.enterprisepm.repository.ProjectRepository;
import com.enterprisepm.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportSchedulerService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final EmailService emailService;

    // Every Monday at 08:00 — weekly report
    @Scheduled(cron = "0 0 8 * * MON")
    public void sendWeeklyReports() {
        sendReportsToProjectOwners("Weekly");
    }

    // 1st of every month at 08:00 — monthly report
    @Scheduled(cron = "0 0 8 1 * *")
    public void sendMonthlyReports() {
        sendReportsToProjectOwners("Monthly");
    }

    private void sendReportsToProjectOwners(String period) {
        List<Project> projects = projectRepository.findAll();
        for (Project project : projects) {
            if (project.getOwner() == null) continue;
            List<Task> tasks = taskRepository.findByProjectId(project.getId());
            long total = tasks.size();
            long done = tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
            long inProgress = tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
            long todo = tasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count();

            String summary = String.format(
                    "  Status:      %s%n" +
                    "  Total Tasks: %d%n" +
                    "  Done:        %d%n" +
                    "  In Progress: %d%n" +
                    "  To Do:       %d",
                    project.getStatus().name(), total, done, inProgress, todo);

            emailService.sendReportEmail(
                    project.getOwner().getEmail(),
                    project.getOwner().getName(),
                    "[" + period + "] " + project.getName(),
                    summary);
        }
    }
}
