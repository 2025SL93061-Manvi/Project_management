package com.enterprisepm.controller;

import com.enterprisepm.dto.ComplaintDTO;
import com.enterprisepm.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final AdminService adminService;

    @GetMapping("/my")
    public ResponseEntity<List<ComplaintDTO>> getMyComplaints(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(adminService.getComplaintsByEmail(userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<ComplaintDTO> create(
            @Valid @RequestBody ComplaintDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(adminService.create(dto, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ComplaintDTO> edit(
            @PathVariable Long id,
            @RequestBody ComplaintDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(adminService.edit(id, dto, userDetails.getUsername()));
    }
}
