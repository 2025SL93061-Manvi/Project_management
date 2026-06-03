package com.enterprisepm.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class EmailService {

    private final Resend resend;

    @Value("${resend.from}")
    private String fromEmail;

    @Value("${app.name}")
    private String appName;

    public EmailService(@Value("${resend.api-key}") String apiKey) {
        this.resend = new Resend(apiKey);
    }

    @Async
    public void sendTaskAssignmentEmail(String toEmail, String userName,
                                        String taskTitle, String projectName,
                                        LocalDate dueDate) {
        String subject = "[" + appName + "] New Task Assigned: " + taskTitle;
        String body = "Hi " + userName + ",\n\n"
                + "You have been assigned a new task:\n\n"
                + "  Task:    " + taskTitle + "\n"
                + "  Project: " + projectName + "\n"
                + "  Due:     " + (dueDate != null ? dueDate.toString() : "No due date") + "\n\n"
                + "Please log in to view the full details.\n\n"
                + "Regards,\n" + appName;
        send(toEmail, subject, body);
    }

    @Async
    public void sendMeetingNotificationEmail(String toEmail, String userName,
                                              String meetingTitle, String projectName,
                                              LocalDateTime meetingDate, String location) {
        String subject = "[" + appName + "] Meeting Scheduled: " + meetingTitle;
        String body = "Hi " + userName + ",\n\n"
                + "A meeting has been scheduled for your project:\n\n"
                + "  Meeting: " + meetingTitle + "\n"
                + "  Project: " + projectName + "\n"
                + "  Date:    " + meetingDate.toString() + "\n"
                + "  Where:   " + (location != null ? location : "TBD") + "\n\n"
                + "Please add it to your calendar.\n\n"
                + "Regards,\n" + appName;
        send(toEmail, subject, body);
    }

    @Async
    public void sendReportEmail(String toEmail, String userName,
                                 String projectName, String reportSummary) {
        String subject = "[" + appName + "] Weekly Report: " + projectName;
        String body = "Hi " + userName + ",\n\n"
                + "Here is the weekly status report for: " + projectName + "\n\n"
                + reportSummary + "\n\n"
                + "Log in to download the full Excel report.\n\n"
                + "Regards,\n" + appName;
        send(toEmail, subject, body);
    }

    @Async
    public void sendMilestoneCompletedEmail(String toEmail, String userName,
                                             String milestoneTitle, String projectName) {
        String subject = "[" + appName + "] Milestone Completed: " + milestoneTitle;
        String body = "Hi " + userName + ",\n\n"
                + "A milestone has been marked as completed:\n\n"
                + "  Milestone: " + milestoneTitle + "\n"
                + "  Project:   " + projectName + "\n\n"
                + "Great progress! Log in to view the full status.\n\n"
                + "Regards,\n" + appName;
        send(toEmail, subject, body);
    }

    @Async
    public void sendComplaintStatusEmail(String toEmail, String userName,
                                          String complaintTitle, String newStatus) {
        String subject = "[" + appName + "] Your submission has been updated: " + complaintTitle;
        String body = "Hi " + userName + ",\n\n"
                + "The status of your submission has been updated:\n\n"
                + "  Title:  " + complaintTitle + "\n"
                + "  Status: " + newStatus + "\n\n"
                + "Log in for more details.\n\n"
                + "Regards,\n" + appName;
        send(toEmail, subject, body);
    }

    @Async
    public void sendProjectStatusEmail(String toEmail, String userName,
                                        String projectName, String newStatus) {
        String subject = "[" + appName + "] Project Status Updated: " + projectName;
        String body = "Hi " + userName + ",\n\n"
                + "The status of your project has changed:\n\n"
                + "  Project: " + projectName + "\n"
                + "  Status:  " + newStatus + "\n\n"
                + "Log in to view your project dashboard.\n\n"
                + "Regards,\n" + appName;
        send(toEmail, subject, body);
    }

    @Async
    public void sendMeetingReminderEmail(String toEmail, String userName,
                                          String meetingTitle, String projectName,
                                          LocalDateTime meetingDate, String location,
                                          String timeUntil) {
        String subject = "[" + appName + "] Reminder: Meeting in " + timeUntil + " — " + meetingTitle;
        String body = "Hi " + userName + ",\n\n"
                + "This is a reminder that a meeting is coming up soon:\n\n"
                + "  Meeting: " + meetingTitle + "\n"
                + "  Project: " + projectName + "\n"
                + "  Date:    " + meetingDate.toString() + "\n"
                + "  Where:   " + (location != null ? location : "TBD") + "\n"
                + "  Starts:  " + timeUntil + "\n\n"
                + "Please make sure you're prepared and on time.\n\n"
                + "Regards,\n" + appName;
        send(toEmail, subject, body);
    }

    @Async
    public void sendTaskDueSoonEmail(String toEmail, String userName,
                                      String taskTitle, String projectName,
                                      LocalDate dueDate, String timeUntil) {
        String subject = "[" + appName + "] Task Due " + timeUntil + ": " + taskTitle;
        String body = "Hi " + userName + ",\n\n"
                + "A task assigned to you is due soon:\n\n"
                + "  Task:    " + taskTitle + "\n"
                + "  Project: " + projectName + "\n"
                + "  Due:     " + dueDate.toString() + "\n"
                + "  Due in:  " + timeUntil + "\n\n"
                + "Please log in to update the task status.\n\n"
                + "Regards,\n" + appName;
        send(toEmail, subject, body);
    }

    @Async
    public void sendMilestoneDueSoonEmail(String toEmail, String userName,
                                           String milestoneTitle, String projectName,
                                           LocalDate dueDate, String timeUntil) {
        String subject = "[" + appName + "] Milestone Due " + timeUntil + ": " + milestoneTitle;
        String body = "Hi " + userName + ",\n\n"
                + "A milestone in your project is due soon:\n\n"
                + "  Milestone: " + milestoneTitle + "\n"
                + "  Project:   " + projectName + "\n"
                + "  Due:       " + dueDate.toString() + "\n"
                + "  Due in:    " + timeUntil + "\n\n"
                + "Please log in to review progress.\n\n"
                + "Regards,\n" + appName;
        send(toEmail, subject, body);
    }

    @Async
    public void sendAccountStatusEmail(String toEmail, String userName, boolean enabled) {
        String state = enabled ? "re-enabled" : "disabled";
        String subject = "[" + appName + "] Your account has been " + state;
        String body = "Hi " + userName + ",\n\n"
                + "Your account has been " + state + " by an administrator.\n\n"
                + (enabled ? "You can now log in normally."
                           : "Please contact your administrator if you believe this is an error.")
                + "\n\nRegards,\n" + appName;
        send(toEmail, subject, body);
    }

    private void send(String to, String subject, String body) {
        if (fromEmail == null || fromEmail.isBlank() || fromEmail.contains("your-email")) {
            System.out.println("[EmailService] Resend not configured — skipping email to " + to);
            return;
        }
        try {
            CreateEmailOptions options = CreateEmailOptions.builder()
                    .from(fromEmail)
                    .to(to)
                    .subject(subject)
                    .text(body)
                    .build();
            resend.emails().send(options);
        } catch (ResendException e) {
            System.err.println("Email send failed to " + to + ": " + e.getMessage());
        }
    }
}
