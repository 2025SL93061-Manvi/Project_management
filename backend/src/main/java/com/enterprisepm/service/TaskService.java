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

    public TaskDTO create(TaskDTO dto) {
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

        // Legacy single assignee (kept for backward-compat)
        if (dto.getAssignedToId() != null) {
            User assignee = userRepository.findById(dto.getAssignedToId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            task.setAssignedTo(assignee);
        }

        // Multi-assignees
        List<User> assignees = resolveAssignees(dto, project);
        task.setAssignees(assignees);

        Task saved = taskRepository.save(task);

        // Send email to all assignees
        for (User a : assignees) {
            emailService.sendTaskAssignmentEmail(
                    a.getEmail(), a.getName(), saved.getTitle(), project.getName(), dto.getEndDate());
        }

        return toDTO(saved);
    }

    public TaskDTO update(Long id, TaskDTO dto) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setStatus(TaskStatus.valueOf(dto.getStatus()));
        task.setPriority(TaskPriority.valueOf(dto.getPriority()));
        task.setStartDate(dto.getStartDate());
        task.setEndDate(dto.getEndDate());

        // Legacy single assignee
        if (dto.getAssignedToId() != null) {
            User assignee = userRepository.findById(dto.getAssignedToId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            task.setAssignedTo(assignee);
        } else {
            task.setAssignedTo(null);
        }

        // Multi-assignees: detect newly added
        List<User> oldAssignees = new ArrayList<>(task.getAssignees());
        List<User> newAssignees = resolveAssignees(dto, task.getProject());
        task.setAssignees(newAssignees);

        Task saved = taskRepository.save(task);

        // Email only newly added assignees
        List<Long> oldIds = oldAssignees.stream().map(User::getId).collect(Collectors.toList());
        for (User a : newAssignees) {
            if (!oldIds.contains(a.getId())) {
                emailService.sendTaskAssignmentEmail(
                        a.getEmail(), a.getName(), saved.getTitle(),
                        saved.getProject().getName(), dto.getEndDate());
            }
        }

        return toDTO(saved);
    }

    public void delete(Long id) {
        taskRepository.deleteById(id);
    }

    private List<User> resolveAssignees(TaskDTO dto, Project project) {
        if (dto.getAssigneeIds() != null && !dto.getAssigneeIds().isEmpty()) {
            return userRepository.findAllById(dto.getAssigneeIds());
        }
        // Fall back to single assignedToId if multi-list not provided
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
