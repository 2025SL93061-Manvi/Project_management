package com.enterprisepm.repository;

import com.enterprisepm.model.Task;
import com.enterprisepm.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);
    List<Task> findByAssignedTo(User user);
    long countByProjectId(Long projectId);

    @Query("SELECT DISTINCT t FROM Task t WHERE t.assignedTo = :user OR :user MEMBER OF t.assignees")
    List<Task> findByAssignedToOrAssigneesContaining(@Param("user") User user);

    List<Task> findByAssigneesContaining(User user);
}
