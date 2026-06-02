package com.enterprisepm.service;

import com.enterprisepm.dto.TaskDTO;
import com.enterprisepm.model.*;
import com.enterprisepm.repository.ProjectRepository;
import com.enterprisepm.repository.TaskRepository;
import com.enterprisepm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
        return taskRepository.findByAssignedTo(user)
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
        if (dto.getAssignedToId() != null) {
            User assignee = userRepository.findById(dto.getAssignedToId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            task.setAssignedTo(assignee);
            emailService.sendTaskAssignmentEmail(
                    assignee.getEmail(), assignee.getName(),
                    task.getTitle(), project.getName(), dto.getEndDate());
        }
        return toDTO(taskRepository.save(task));
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
        if (dto.getAssignedToId() != null) {
            User assignee = userRepository.findById(dto.getAssignedToId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            boolean isNewAssignment = task.getAssignedTo() == null
                    || !task.getAssignedTo().getId().equals(assignee.getId());
            task.setAssignedTo(assignee);
            if (isNewAssignment) {
                emailService.sendTaskAssignmentEmail(
                        assignee.getEmail(), assignee.getName(),
                        task.getTitle(), task.getProject().getName(), dto.getEndDate());
            }
        } else {
            task.setAssignedTo(null);
        }
        return toDTO(taskRepository.save(task));
    }

    public void delete(Long id) {
        taskRepository.deleteById(id);
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
        return dto;
    }
}
