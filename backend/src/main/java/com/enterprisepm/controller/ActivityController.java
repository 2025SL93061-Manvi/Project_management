package com.enterprisepm.controller;

import com.enterprisepm.dto.ActivityLogDTO;
import com.enterprisepm.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activity")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityLogService activityLogService;

    @GetMapping
    public ResponseEntity<List<ActivityLogDTO>> getAll() {
        return ResponseEntity.ok(activityLogService.getAll());
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ActivityLogDTO>> getByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(activityLogService.getByProject(projectId));
    }
}
