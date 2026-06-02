package com.enterprisepm.controller;

import com.enterprisepm.dto.MilestoneDTO;
import com.enterprisepm.service.MilestoneService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/milestones")
@RequiredArgsConstructor
public class MilestoneController {

    private final MilestoneService milestoneService;

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<MilestoneDTO>> getByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(milestoneService.getByProject(projectId));
    }

    @PostMapping
    public ResponseEntity<MilestoneDTO> create(@Valid @RequestBody MilestoneDTO dto) {
        return ResponseEntity.ok(milestoneService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MilestoneDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody MilestoneDTO dto) {
        return ResponseEntity.ok(milestoneService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        milestoneService.delete(id);
        return ResponseEntity.ok("Milestone deleted");
    }
}
