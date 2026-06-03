package com.enterprisepm.controller;

import com.enterprisepm.dto.ComplaintDTO;
import com.enterprisepm.dto.UserDTO;
import com.enterprisepm.model.User;
import com.enterprisepm.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ── User management ──────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{userId}/toggle")
    public ResponseEntity<String> toggleUser(@PathVariable Long userId) {
        adminService.toggleUserStatus(userId);
        return ResponseEntity.ok("User status updated");
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<User> updateUser(@PathVariable Long userId, @RequestBody UserDTO dto) {
        return ResponseEntity.ok(adminService.updateUser(userId, dto));
    }

    // ── Complaint management (admin-only) ─────────────────────────────────────

    @GetMapping("/complaints")
    public ResponseEntity<List<ComplaintDTO>> getAllComplaints() {
        return ResponseEntity.ok(adminService.getAllComplaints());
    }

    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<ComplaintDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(adminService.updateStatus(id, status));
    }

    @DeleteMapping("/complaints/{id}")
    public ResponseEntity<Void> deleteComplaint(@PathVariable Long id) {
        adminService.deleteComplaint(id);
        return ResponseEntity.noContent().build();
    }
}
