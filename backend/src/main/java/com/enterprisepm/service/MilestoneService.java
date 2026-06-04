package com.enterprisepm.service;

import com.enterprisepm.dto.MilestoneDTO;
import com.enterprisepm.model.Milestone;
import com.enterprisepm.model.Project;
import com.enterprisepm.repository.MilestoneRepository;
import com.enterprisepm.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;
    private final EmailService emailService;
    private final ActivityLogService activityLogService;
    private final NotificationService notificationService;

    public List<MilestoneDTO> getByProject(Long projectId) {
        return milestoneRepository.findByProjectId(projectId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public MilestoneDTO create(MilestoneDTO dto) {
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
        Milestone milestone = new Milestone();
        milestone.setTitle(dto.getTitle());
        milestone.setDueDate(dto.getDueDate());
        milestone.setCompleted(dto.isCompleted());
        milestone.setProject(project);
        Milestone saved = milestoneRepository.save(milestone);

        Long ownerId = project.getOwner() != null ? project.getOwner().getId() : null;
        activityLogService.log(ownerId, "CREATED", "MILESTONE", saved.getId(),
                saved.getTitle(), project.getId(), project.getName());

        return toDTO(saved);
    }

    public MilestoneDTO update(Long id, MilestoneDTO dto) {
        Milestone milestone = milestoneRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));
        boolean wasCompleted = milestone.isCompleted();
        milestone.setTitle(dto.getTitle());
        milestone.setDueDate(dto.getDueDate());
        milestone.setCompleted(dto.isCompleted());
        Milestone saved = milestoneRepository.save(milestone);

        Project project = saved.getProject();
        Long ownerId = project.getOwner() != null ? project.getOwner().getId() : null;

        String action = (!wasCompleted && saved.isCompleted()) ? "COMPLETED" : "UPDATED";
        activityLogService.log(ownerId, action, "MILESTONE", saved.getId(),
                saved.getTitle(), project.getId(), project.getName());

        if (!wasCompleted && saved.isCompleted()) {
            // Email project owner
            if (project.getOwner() != null) {
                emailService.sendMilestoneCompletedEmail(
                        project.getOwner().getEmail(),
                        project.getOwner().getName(),
                        saved.getTitle(),
                        project.getName());
            }
            // Notify all project members
            project.getMembers().forEach(member ->
                notificationService.notifyUser(member.getId(),
                        "Milestone completed: " + saved.getTitle(),
                        "Milestone \"" + saved.getTitle() + "\" was marked complete in " + project.getName(),
                        "MILESTONE_COMPLETED", "MILESTONE", saved.getId(),
                        "/projects/" + project.getId() + "/milestones")
            );
            // Notify owner if not a member
            if (ownerId != null) {
                boolean ownerIsMember = project.getMembers().stream()
                        .anyMatch(m -> m.getId().equals(ownerId));
                if (!ownerIsMember) {
                    notificationService.notifyUser(ownerId,
                            "Milestone completed: " + saved.getTitle(),
                            "Milestone \"" + saved.getTitle() + "\" was marked complete in " + project.getName(),
                            "MILESTONE_COMPLETED", "MILESTONE", saved.getId(),
                            "/projects/" + project.getId() + "/milestones");
                }
            }
        }

        return toDTO(saved);
    }

    public void delete(Long id) {
        Milestone milestone = milestoneRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));
        Long ownerId = milestone.getProject().getOwner() != null
                ? milestone.getProject().getOwner().getId() : null;
        activityLogService.log(ownerId, "DELETED", "MILESTONE", milestone.getId(),
                milestone.getTitle(), milestone.getProject().getId(), milestone.getProject().getName());
        milestoneRepository.deleteById(id);
    }

    private MilestoneDTO toDTO(Milestone m) {
        MilestoneDTO dto = new MilestoneDTO();
        dto.setId(m.getId());
        dto.setTitle(m.getTitle());
        dto.setDueDate(m.getDueDate());
        dto.setCompleted(m.isCompleted());
        dto.setProjectId(m.getProject().getId());
        dto.setCreatedAt(m.getCreatedAt());
        return dto;
    }
}
