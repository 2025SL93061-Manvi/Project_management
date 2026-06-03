package com.enterprisepm.service;

import com.enterprisepm.model.Meeting;
import com.enterprisepm.model.Milestone;
import com.enterprisepm.model.Task;
import com.enterprisepm.model.TaskStatus;
import com.enterprisepm.model.User;
import com.enterprisepm.repository.MeetingRepository;
import com.enterprisepm.repository.MilestoneRepository;
import com.enterprisepm.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReminderSchedulerService {

    private final MeetingRepository meetingRepository;
    private final TaskRepository taskRepository;
    private final MilestoneRepository milestoneRepository;
    private final EmailService emailService;

    // Runs every hour at :00 — checks for upcoming meetings and due dates
    @Scheduled(cron = "0 0 * * * *")
    public void sendReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();

        sendMeetingReminders(now);
        sendTaskDueReminders(today);
        sendMilestoneDueReminders(today);
    }

    private void sendMeetingReminders(LocalDateTime now) {
        // 1-hour window: meetings starting between now+55min and now+65min
        List<Meeting> in1h = meetingRepository.findByMeetingDateBetween(
                now.plusMinutes(55), now.plusMinutes(65));

        for (Meeting meeting : in1h) {
            notifyMeetingParticipants(meeting, "1 hour");
        }

        // 24-hour window: meetings starting between now+23h55m and now+24h5m
        List<Meeting> in24h = meetingRepository.findByMeetingDateBetween(
                now.plusHours(23).plusMinutes(55), now.plusHours(24).plusMinutes(5));

        for (Meeting meeting : in24h) {
            notifyMeetingParticipants(meeting, "tomorrow");
        }
    }

    private void notifyMeetingParticipants(Meeting meeting, String timeUntil) {
        List<User> members = meeting.getProject().getMembers();
        for (User member : members) {
            emailService.sendMeetingReminderEmail(
                    member.getEmail(),
                    member.getName(),
                    meeting.getTitle(),
                    meeting.getProject().getName(),
                    meeting.getMeetingDate(),
                    meeting.getLocation(),
                    timeUntil);
        }
    }

    private void sendTaskDueReminders(LocalDate today) {
        // Tasks due today
        List<Task> dueToday = taskRepository.findByEndDateAndStatusNot(today, TaskStatus.DONE);
        for (Task task : dueToday) {
            notifyTaskAssignees(task, "today");
        }

        // Tasks due tomorrow
        List<Task> dueTomorrow = taskRepository.findByEndDateAndStatusNot(today.plusDays(1), TaskStatus.DONE);
        for (Task task : dueTomorrow) {
            notifyTaskAssignees(task, "tomorrow");
        }
    }

    private void notifyTaskAssignees(Task task, String timeUntil) {
        // Notify both single assignee and multi-assignees, deduplicating by email
        java.util.Set<String> notified = new java.util.HashSet<>();

        if (task.getAssignedTo() != null) {
            User u = task.getAssignedTo();
            if (notified.add(u.getEmail())) {
                sendTaskReminder(u, task, timeUntil);
            }
        }
        for (User u : task.getAssignees()) {
            if (notified.add(u.getEmail())) {
                sendTaskReminder(u, task, timeUntil);
            }
        }
    }

    private void sendTaskReminder(User user, Task task, String timeUntil) {
        emailService.sendTaskDueSoonEmail(
                user.getEmail(),
                user.getName(),
                task.getTitle(),
                task.getProject().getName(),
                task.getEndDate(),
                timeUntil);
    }

    private void sendMilestoneDueReminders(LocalDate today) {
        // Milestones due today (incomplete)
        List<Milestone> dueToday = milestoneRepository.findByDueDateAndCompletedFalse(today);
        for (Milestone milestone : dueToday) {
            notifyMilestoneOwner(milestone, "today");
        }

        // Milestones due tomorrow (incomplete)
        List<Milestone> dueTomorrow = milestoneRepository.findByDueDateAndCompletedFalse(today.plusDays(1));
        for (Milestone milestone : dueTomorrow) {
            notifyMilestoneOwner(milestone, "tomorrow");
        }
    }

    private void notifyMilestoneOwner(Milestone milestone, String timeUntil) {
        User owner = milestone.getProject().getOwner();
        if (owner == null) return;
        emailService.sendMilestoneDueSoonEmail(
                owner.getEmail(),
                owner.getName(),
                milestone.getTitle(),
                milestone.getProject().getName(),
                milestone.getDueDate(),
                timeUntil);
    }
}
