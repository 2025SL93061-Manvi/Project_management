package com.enterprisepm.controller;

import com.enterprisepm.dto.ComplaintDTO;
import com.enterprisepm.model.User;
import com.enterprisepm.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{userId}/toggle")
    public ResponseEntity<String> toggleUser(@PathVariable Long userId) {
        adminService.toggleUserStatus(userId);
        return ResponseEntity.ok("User status updated");
    }

    @GetMapping("/complaints")
    public ResponseEntity<List<ComplaintDTO>> getAllComplaints() {
        return ResponseEntity.ok(adminService.getAllComplaints());
    }

    @GetMapping("/complaints/my")
    public ResponseEntity<List<ComplaintDTO>> getMyComplaints(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<User> users = adminService.getAllUsers();
        Long userId = users.stream()
                .filter(u -> u.getEmail().equals(userDetails.getUsername()))
                .findFirst()
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(adminService.getComplaintsByUser(userId));
    }

    @PostMapping("/complaints")
    public ResponseEntity<ComplaintDTO> create(
            @Valid @RequestBody ComplaintDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(adminService.create(dto, userDetails.getUsername()));
    }

    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<ComplaintDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(adminService.updateStatus(id, status));
    }

    @PutMapping("/complaints/{id}")
    public ResponseEntity<ComplaintDTO> editComplaint(
            @PathVariable Long id,
            @RequestBody ComplaintDTO dto) {
        return ResponseEntity.ok(adminService.edit(id, dto));
    }
}
