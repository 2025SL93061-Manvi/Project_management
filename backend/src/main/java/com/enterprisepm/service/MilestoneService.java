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
        return toDTO(milestoneRepository.save(milestone));
    }

    public MilestoneDTO update(Long id, MilestoneDTO dto) {
        Milestone milestone = milestoneRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));
        boolean wasCompleted = milestone.isCompleted();
        milestone.setTitle(dto.getTitle());
        milestone.setDueDate(dto.getDueDate());
        milestone.setCompleted(dto.isCompleted());
        Milestone saved = milestoneRepository.save(milestone);

        // Email project owner when milestone is newly marked complete
        if (!wasCompleted && saved.isCompleted()) {
            Project project = saved.getProject();
            if (project.getOwner() != null) {
                emailService.sendMilestoneCompletedEmail(
                        project.getOwner().getEmail(),
                        project.getOwner().getName(),
                        saved.getTitle(),
                        project.getName());
            }
        }

        return toDTO(saved);
    }

    public void delete(Long id) {
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
