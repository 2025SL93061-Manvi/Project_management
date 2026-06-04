package com.enterprisepm.service;

import com.enterprisepm.dto.TaskDTO;
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
class TaskServiceTest {

    @Mock private TaskRepository taskRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private UserRepository userRepository;
    @Mock private EmailService emailService;
    @Mock private ActivityLogService activityLogService;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private TaskService taskService;

    private Project project;
    private User user;
    private Task task;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setName("Alice");
        user.setEmail("alice@test.com");
        user.setRole(Role.DEVELOPER);

        project = new Project();
        project.setId(10L);
        project.setName("Test Project");
        project.setStatus(ProjectStatus.PLANNING);
        project.setOwner(user);

        task = new Task();
        task.setId(100L);
        task.setTitle("Fix bug");
        task.setStatus(TaskStatus.TODO);
        task.setPriority(TaskPriority.MEDIUM);
        task.setProject(project);
        task.setAssignees(List.of(user));
    }

    @Test
    void getTasksByProject_returnsMappedDTOs() {
        when(taskRepository.findByProjectId(10L)).thenReturn(List.of(task));

        List<TaskDTO> result = taskService.getTasksByProject(10L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Fix bug");
    }

    @Test
    void create_savesTaskAndReturnsDTO() {
        TaskDTO dto = new TaskDTO();
        dto.setTitle("New Task");
        dto.setProjectId(10L);

        when(projectRepository.findById(10L)).thenReturn(Optional.of(project));
        when(taskRepository.save(any(Task.class))).thenReturn(task);
        doNothing().when(activityLogService).log(any(), any(), any(), any(), any(), any(), any());

        TaskDTO result = taskService.create(dto, user);

        assertThat(result).isNotNull();
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    void create_throwsWhenProjectNotFound() {
        TaskDTO dto = new TaskDTO();
        dto.setTitle("Task");
        dto.setProjectId(99L);

        when(projectRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.create(dto, user))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Project not found");
    }

    @Test
    void delete_removesTask() {
        when(taskRepository.findById(100L)).thenReturn(Optional.of(task));
        doNothing().when(activityLogService).log(any(), any(), any(), any(), any(), any(), any());

        taskService.delete(100L, user);

        verify(taskRepository).deleteById(100L);
    }

    @Test
    void delete_throwsWhenTaskNotFound() {
        when(taskRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.delete(999L, user))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Task not found");
    }

    @Test
    void toDTO_mapsAllFields() {
        TaskDTO dto = taskService.toDTO(task);

        assertThat(dto.getId()).isEqualTo(100L);
        assertThat(dto.getTitle()).isEqualTo("Fix bug");
        assertThat(dto.getStatus()).isEqualTo("TODO");
        assertThat(dto.getPriority()).isEqualTo("MEDIUM");
        assertThat(dto.getProjectId()).isEqualTo(10L);
    }
}
