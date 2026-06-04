package com.enterprisepm.service;

import com.enterprisepm.dto.ProjectDTO;
import com.enterprisepm.model.*;
import com.enterprisepm.repository.ProjectRepository;
import com.enterprisepm.repository.TaskRepository;
import com.enterprisepm.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock private ProjectRepository projectRepository;
    @Mock private UserRepository userRepository;
    @Mock private TaskRepository taskRepository;
    @Mock private EmailService emailService;

    @InjectMocks
    private ProjectService projectService;

    private User owner;
    private Project project;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(1L);
        owner.setName("Alice");
        owner.setEmail("alice@test.com");
        owner.setRole(Role.MANAGER);

        project = new Project();
        project.setId(10L);
        project.setName("Alpha");
        project.setStatus(ProjectStatus.PLANNING);
        project.setOwner(owner);
        project.setMembers(List.of());
    }

    @Test
    void getAllProjects_returnsAllMapped() {
        when(projectRepository.findAll()).thenReturn(List.of(project));
        when(taskRepository.countByProjectId(10L)).thenReturn(3L);

        List<ProjectDTO> result = projectService.getAllProjects();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Alpha");
        assertThat(result.get(0).getTotalTasks()).isEqualTo(3);
    }

    @Test
    void getById_returnsProjectDTO() {
        when(projectRepository.findById(10L)).thenReturn(Optional.of(project));
        when(taskRepository.countByProjectId(10L)).thenReturn(0L);

        ProjectDTO result = projectService.getById(10L);

        assertThat(result.getId()).isEqualTo(10L);
        assertThat(result.getOwnerName()).isEqualTo("Alice");
    }

    @Test
    void getById_throwsWhenNotFound() {
        when(projectRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> projectService.getById(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Project not found");
    }

    @Test
    void create_savesProjectWithFallbackOwner() {
        ProjectDTO dto = new ProjectDTO();
        dto.setName("Beta");
        dto.setStatus("PLANNING");

        when(userRepository.findByEmail("alice@test.com")).thenReturn(Optional.of(owner));
        when(projectRepository.save(any(Project.class))).thenReturn(project);
        when(taskRepository.countByProjectId(10L)).thenReturn(0L);

        ProjectDTO result = projectService.create(dto, "alice@test.com");

        assertThat(result).isNotNull();
        verify(projectRepository).save(any(Project.class));
    }

    @Test
    void delete_callsRepository() {
        doNothing().when(projectRepository).deleteById(10L);

        projectService.delete(10L);

        verify(projectRepository).deleteById(10L);
    }

    @Test
    void update_sendsEmailOnStatusChange() {
        ProjectDTO dto = new ProjectDTO();
        dto.setName("Alpha");
        dto.setStatus("ACTIVE");

        Project updatedProject = new Project();
        updatedProject.setId(10L);
        updatedProject.setName("Alpha");
        updatedProject.setStatus(ProjectStatus.ACTIVE);
        updatedProject.setOwner(owner);
        updatedProject.setMembers(List.of());

        when(projectRepository.findById(10L)).thenReturn(Optional.of(project));
        when(projectRepository.save(any(Project.class))).thenReturn(updatedProject);
        when(taskRepository.countByProjectId(10L)).thenReturn(0L);

        projectService.update(10L, dto);

        verify(emailService).sendProjectStatusEmail(
                eq("alice@test.com"), eq("Alice"), eq("Alpha"), eq("ACTIVE"));
    }
}
