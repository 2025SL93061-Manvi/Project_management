package com.enterprisepm.repository;

import com.enterprisepm.model.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    List<Meeting> findByProjectId(Long projectId);

    // Used by ReminderSchedulerService to find meetings in a time window
    List<Meeting> findByMeetingDateBetween(LocalDateTime from, LocalDateTime to);
}
