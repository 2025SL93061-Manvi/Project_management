package com.enterprisepm.service;

import com.enterprisepm.dto.ActivityLogDTO;
import com.enterprisepm.model.ActivityLog;
import com.enterprisepm.repository.ActivityLogRepository;
import com.enterprisepm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    @Async
    public void log(Long actorId, String action, String entityType, Long entityId,
                    String entityName, Long projectId, String projectName) {
        ActivityLog log = new ActivityLog();
        if (actorId != null) {
            userRepository.findById(actorId).ifPresent(log::setUser);
        }
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setEntityName(entityName);
        log.setProjectId(projectId);
        log.setProjectName(projectName);
        activityLogRepository.save(log);
    }

    public List<ActivityLogDTO> getRecentForProjects(List<Long> projectIds) {
        LocalDateTime since = LocalDateTime.now().minusHours(6);
        List<ActivityLog> results = activityLogRepository
                .findTop20ByProjectIdInAndCreatedAtAfterOrderByCreatedAtDesc(projectIds, since);
        if (results.isEmpty()) {
            results = activityLogRepository
                    .findTop20ByProjectIdInOrderByCreatedAtDesc(projectIds);
        }
        return results.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ActivityLogDTO> getByProject(Long projectId) {
        return activityLogRepository
                .findTop30ByProjectIdOrderByCreatedAtDesc(projectId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ActivityLogDTO> getAll() {
        return activityLogRepository
                .findTop50ByOrderByCreatedAtDesc()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    private ActivityLogDTO toDTO(ActivityLog a) {
        ActivityLogDTO dto = new ActivityLogDTO();
        dto.setId(a.getId());
        dto.setAction(a.getAction());
        dto.setEntityType(a.getEntityType());
        dto.setEntityId(a.getEntityId());
        dto.setEntityName(a.getEntityName());
        dto.setProjectId(a.getProjectId());
        dto.setProjectName(a.getProjectName());
        dto.setCreatedAt(a.getCreatedAt());
        if (a.getUser() != null) {
            dto.setUserId(a.getUser().getId());
            dto.setUserName(a.getUser().getName());
        }
        return dto;
    }
}
