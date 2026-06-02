package com.enterprisepm.service;

import com.enterprisepm.dto.ProjectDTO;
import com.enterprisepm.model.Project;
import com.enterprisepm.model.ProjectStatus;
import com.enterprisepm.model.User;
import com.enterprisepm.repository.ProjectRepository;
import com.enterprisepm.repository.TaskRepository;
import com.enterprisepm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final EmailService emailService;

    public List<ProjectDTO> getAllProjects() {
        return projectRepository.findAll()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ProjectDTO> getProjectsForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Project> owned = projectRepository.findByOwner(user);
        List<Project> member = projectRepository.findByMembersContaining(user);
        owned.addAll(member);
        return owned.stream().distinct().map(this::toDTO).collect(Collectors.toList());
    }

    public ProjectDTO getById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        return toDTO(project);
    }

    public ProjectDTO create(ProjectDTO dto, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Project project = new Project();
        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        project.setStatus(ProjectStatus.valueOf(dto.getStatus() != null ? dto.getStatus() : "PLANNING"));
        project.setStartDate(dto.getStartDate());
        project.setEndDate(dto.getEndDate());
        project.setOwner(owner);
        if (dto.getMemberIds() != null) {
            List<User> members = userRepository.findAllById(dto.getMemberIds());
            project.setMembers(members);
        }
        return toDTO(projectRepository.save(project));
    }

    public ProjectDTO update(Long id, ProjectDTO dto) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        ProjectStatus oldStatus = project.getStatus();
        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        project.setStatus(ProjectStatus.valueOf(dto.getStatus()));
        project.setStartDate(dto.getStartDate());
        project.setEndDate(dto.getEndDate());
        if (dto.getMemberIds() != null) {
            List<User> members = userRepository.findAllById(dto.getMemberIds());
            project.setMembers(members);
        }
        Project saved = projectRepository.save(project);

        // Email owner when status changes
        if (!oldStatus.equals(saved.getStatus()) && saved.getOwner() != null) {
            emailService.sendProjectStatusEmail(
                    saved.getOwner().getEmail(),
                    saved.getOwner().getName(),
                    saved.getName(),
                    saved.getStatus().name());
        }

        return toDTO(saved);
    }

    public void delete(Long id) {
        projectRepository.deleteById(id);
    }

    public ProjectDTO toDTO(Project project) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setStatus(project.getStatus().name());
        dto.setStartDate(project.getStartDate());
        dto.setEndDate(project.getEndDate());
        dto.setOwnerName(project.getOwner() != null ? project.getOwner().getName() : "");
        dto.setOwnerId(project.getOwner() != null ? project.getOwner().getId() : null);
        dto.setTotalTasks((int) taskRepository.countByProjectId(project.getId()));
        dto.setCreatedAt(project.getCreatedAt());
        return dto;
    }
}
