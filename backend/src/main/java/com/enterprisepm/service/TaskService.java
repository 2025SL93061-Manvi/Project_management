package com.enterprisepm.service;

import com.enterprisepm.dto.TaskDTO;
import com.enterprisepm.model.*;
import com.enterprisepm.repository.ProjectRepository;
import com.enterprisepm.repository.TaskRepository;
import com.enterprisepm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final ActivityLogService activityLogService;
    private final NotificationService notificationService;

    public List<TaskDTO> getTasksByProject(Long projectId) {
        return taskRepository.findByProjectId(projectId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<TaskDTO> getTasksByUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return taskRepository.findByAssignedToOrAssigneesContaining(user)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public TaskDTO create(TaskDTO dto, User actor) {
        Task task = new Task();
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setStatus(TaskStatus.valueOf(dto.getStatus() != null ? dto.getStatus() : "TODO"));
        task.setPriority(TaskPriority.valueOf(dto.getPriority() != null ? dto.getPriority() : "MEDIUM"));
        task.setStartDate(dto.getStartDate());
        task.setEndDate(dto.getEndDate());
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
        task.setProject(project);

        if (dto.getAssignedToId() != null) {
            User assignee = userRepository.findById(dto.getAssignedToId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            task.setAssignedTo(assignee);
        }

        List<User> assignees = resolveAssignees(dto, project);
        task.setAssignees(assignees);

        Task saved = taskRepository.save(task);

        Long actorId = actor != null ? actor.getId() : null;
        String actorName = actor != null ? actor.getName() : "Someone";

        activityLogService.log(actorId, "CREATED", "TASK", saved.getId(),
                saved.getTitle(), project.getId(), project.getName());

        for (User a : assignees) {
            emailService.sendTaskAssignmentEmail(
                    a.getEmail(), a.getName(), saved.getTitle(), project.getName(), dto.getEndDate());
            if (actorId == null || !a.getId().equals(actorId)) {
                notificationService.notifyUser(a.getId(),
                        "New task assigned: " + saved.getTitle(),
                        actorName + " assigned you a task in " + project.getName(),
                        "TASK_ASSIGNED", "TASK", saved.getId(),
                        "/projects/" + project.getId() + "/tasks");
            }
        }

        return toDTO(saved);
    }

    public TaskDTO create(TaskDTO dto) {
        return create(dto, null);
    }

    public TaskDTO update(Long id, TaskDTO dto, User actor) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        String oldStatus = task.getStatus().name();
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setStatus(TaskStatus.valueOf(dto.getStatus()));
        task.setPriority(TaskPriority.valueOf(dto.getPriority()));
        task.setStartDate(dto.getStartDate());
        task.setEndDate(dto.getEndDate());

        if (dto.getAssignedToId() != null) {
            User assignee = userRepository.findById(dto.getAssignedToId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            task.setAssignedTo(assignee);
        } else {
            task.setAssignedTo(null);
        }

        List<User> oldAssignees = new ArrayList<>(task.getAssignees());
        List<User> newAssignees = resolveAssignees(dto, task.getProject());
        task.setAssignees(newAssignees);

        Task saved = taskRepository.save(task);

        Long actorId = actor != null ? actor.getId() : null;
        String actorName = actor != null ? actor.getName() : "Someone";

        String action = !oldStatus.equals(dto.getStatus()) ? "STATUS_CHANGED" : "UPDATED";
        activityLogService.log(actorId, action, "TASK", saved.getId(),
                saved.getTitle(), saved.getProject().getId(), saved.getProject().getName());

        if (!oldStatus.equals(dto.getStatus())) {
            for (User a : newAssignees) {
                if (actorId == null || !a.getId().equals(actorId)) {
                    notificationService.notifyUser(a.getId(),
                            "Task status updated: " + saved.getTitle(),
                            "Status changed from " + oldStatus + " to " + dto.getStatus(),
                            "STATUS_CHANGED", "TASK", saved.getId(),
                            "/projects/" + saved.getProject().getId() + "/tasks");
                }
            }
        }

        List<Long> oldIds = oldAssignees.stream().map(User::getId).collect(Collectors.toList());
        for (User a : newAssignees) {
            if (!oldIds.contains(a.getId())) {
                emailService.sendTaskAssignmentEmail(
                        a.getEmail(), a.getName(), saved.getTitle(),
                        saved.getProject().getName(), dto.getEndDate());
                if (actorId == null || !a.getId().equals(actorId)) {
                    notificationService.notifyUser(a.getId(),
                            "New task assigned: " + saved.getTitle(),
                            actorName + " assigned you a task in " + saved.getProject().getName(),
                            "TASK_ASSIGNED", "TASK", saved.getId(),
                            "/projects/" + saved.getProject().getId() + "/tasks");
                }
            }
        }

        return toDTO(saved);
    }

    public TaskDTO update(Long id, TaskDTO dto) {
        return update(id, dto, null);
    }

    public void delete(Long id, User actor) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        Long actorId = actor != null ? actor.getId() : null;
        activityLogService.log(actorId, "DELETED", "TASK", task.getId(),
                task.getTitle(), task.getProject().getId(), task.getProject().getName());
        taskRepository.deleteById(id);
    }

    public void delete(Long id) {
        delete(id, null);
    }

    private List<User> resolveAssignees(TaskDTO dto, Project project) {
        if (dto.getAssigneeIds() != null && !dto.getAssigneeIds().isEmpty()) {
            return userRepository.findAllById(dto.getAssigneeIds());
        }
        if (dto.getAssignedToId() != null) {
            return userRepository.findById(dto.getAssignedToId())
                    .map(List::of)
                    .orElse(List.of());
        }
        return List.of();
    }

    public TaskDTO toDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus().name());
        dto.setPriority(task.getPriority().name());
        dto.setStartDate(task.getStartDate());
        dto.setEndDate(task.getEndDate());
        dto.setProjectId(task.getProject().getId());
        dto.setCreatedAt(task.getCreatedAt());
        if (task.getAssignedTo() != null) {
            dto.setAssignedToId(task.getAssignedTo().getId());
            dto.setAssignedToName(task.getAssignedTo().getName());
        }
        if (task.getAssignees() != null && !task.getAssignees().isEmpty()) {
            List<Long> ids = new ArrayList<>();
            List<String> names = new ArrayList<>();
            for (User u : task.getAssignees()) { ids.add(u.getId()); names.add(u.getName()); }
            dto.setAssigneeIds(ids);
            dto.setAssigneeNames(names);
        }
        return dto;
    }
}
