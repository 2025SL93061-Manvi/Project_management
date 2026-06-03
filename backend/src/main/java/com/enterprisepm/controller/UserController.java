package com.enterprisepm.controller;

import com.enterprisepm.dto.UserDTO;
import com.enterprisepm.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final AdminService adminService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = adminService.getAllUsers()
                .stream()
                .map(u -> new UserDTO(u.getId(), u.getName(), u.getEmail(), u.getRole().name(), u.isEnabled()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }
}
