package com.enterprisepm.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.name}")
    private String appName;

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

    private void send(String to, String subject, String body) {
        if (fromEmail == null || fromEmail.isBlank() || fromEmail.contains("your-email")) {
            System.out.println("[EmailService] SMTP not configured — skipping email to " + to);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Email send failed to " + to + ": " + e.getMessage());
        }
    }
}
