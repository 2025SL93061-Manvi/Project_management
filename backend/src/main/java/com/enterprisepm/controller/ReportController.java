package com.enterprisepm.controller;

import com.enterprisepm.service.EmailService;
import com.enterprisepm.service.ReportService;
import com.enterprisepm.model.Project;
import com.enterprisepm.model.Task;
import com.enterprisepm.model.TaskStatus;
import com.enterprisepm.repository.ProjectRepository;
import com.enterprisepm.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final EmailService emailService;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    @GetMapping("/project/{projectId}")
    public ResponseEntity<byte[]> downloadReport(@PathVariable Long projectId) throws IOException {
        byte[] report = reportService.generateProjectReport(projectId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"project-report-" + projectId + ".xlsx\"")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(report);
    }

    @PostMapping("/project/{projectId}/email")
    public ResponseEntity<String> emailReport(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserDetails userDetails) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        List<Task> tasks = taskRepository.findByProjectId(projectId);
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
                userDetails.getUsername(),
                project.getOwner() != null ? project.getOwner().getName() : userDetails.getUsername(),
                project.getName(),
                summary);

        return ResponseEntity.ok("Report emailed to " + userDetails.getUsername());
    }
}
