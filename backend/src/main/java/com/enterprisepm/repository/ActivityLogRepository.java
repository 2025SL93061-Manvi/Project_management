package com.enterprisepm.repository;

import com.enterprisepm.model.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findTop30ByProjectIdOrderByCreatedAtDesc(Long projectId);
    List<ActivityLog> findTop50ByOrderByCreatedAtDesc();
    List<ActivityLog> findTop20ByProjectIdInOrderByCreatedAtDesc(List<Long> projectIds);
}
