package com.enterprisepm.repository;

import com.enterprisepm.model.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, Long> {
    List<Milestone> findByProjectId(Long projectId);

    // Used by ReminderSchedulerService — incomplete milestones due on a specific date
    List<Milestone> findByDueDateAndCompletedFalse(LocalDate dueDate);
}
