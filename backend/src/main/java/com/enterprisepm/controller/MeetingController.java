package com.enterprisepm.controller;

import com.enterprisepm.dto.MeetingDTO;
import com.enterprisepm.service.MeetingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meetings")
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<MeetingDTO>> getByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(meetingService.getByProject(projectId));
    }

    @PostMapping
    public ResponseEntity<MeetingDTO> create(
            @Valid @RequestBody MeetingDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(meetingService.create(dto, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MeetingDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody MeetingDTO dto) {
        return ResponseEntity.ok(meetingService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        meetingService.delete(id);
        return ResponseEntity.ok("Meeting deleted");
    }
}
