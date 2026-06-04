package com.enterprisepm.controller;

import com.enterprisepm.dto.TaskDTO;
import com.enterprisepm.model.User;
import com.enterprisepm.repository.UserRepository;
import com.enterprisepm.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final UserRepository userRepository;

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TaskDTO>> getByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(taskService.getTasksByProject(projectId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<TaskDTO>> getMyTasks(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(taskService.getTasksByUser(userDetails.getUsername()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DEVELOPER')")
    public ResponseEntity<TaskDTO> create(
            @Valid @RequestBody TaskDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        User actor = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        return ResponseEntity.ok(taskService.create(dto, actor));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DEVELOPER')")
    public ResponseEntity<TaskDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody TaskDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        User actor = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        return ResponseEntity.ok(taskService.update(id, dto, actor));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DEVELOPER')")
    public ResponseEntity<String> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User actor = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        taskService.delete(id, actor);
        return ResponseEntity.ok("Task deleted");
    }
}
