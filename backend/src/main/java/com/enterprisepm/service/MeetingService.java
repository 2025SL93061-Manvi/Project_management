package com.enterprisepm.service;

import com.enterprisepm.dto.MeetingDTO;
import com.enterprisepm.model.Meeting;
import com.enterprisepm.model.Project;
import com.enterprisepm.model.User;
import com.enterprisepm.repository.MeetingRepository;
import com.enterprisepm.repository.ProjectRepository;
import com.enterprisepm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final ActivityLogService activityLogService;
    private final NotificationService notificationService;
    private final GoogleCalendarService googleCalendarService;

    public List<MeetingDTO> getByProject(Long projectId) {
        return meetingRepository.findByProjectId(projectId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public MeetingDTO create(MeetingDTO dto, String organizerEmail) {
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
        User organizer = userRepository.findByEmail(organizerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Meeting meeting = new Meeting();
        meeting.setTitle(dto.getTitle());
        meeting.setDescription(dto.getDescription());
        meeting.setMeetingDate(dto.getMeetingDate());
        meeting.setLocation(dto.getLocation());
        meeting.setProject(project);
        meeting.setOrganizer(organizer);

        if (dto.isAddGoogleMeet()) {
            String meetLink = googleCalendarService.createMeetLink(
                    dto.getTitle(), dto.getDescription(), dto.getMeetingDate());
            meeting.setMeetingLink(meetLink);
        }

        Meeting saved = meetingRepository.save(meeting);

        activityLogService.log(organizer.getId(), "CREATED", "MEETING", saved.getId(),
                saved.getTitle(), project.getId(), project.getName());

        String dateStr = dto.getMeetingDate() != null ? dto.getMeetingDate().toString() : "";
        String notifMsg = organizer.getName() + " scheduled a meeting in " + project.getName()
                + (dateStr.isBlank() ? "" : " on " + dateStr);

        project.getMembers().forEach(member -> {
            emailService.sendMeetingNotificationEmail(
                    member.getEmail(), member.getName(),
                    meeting.getTitle(), project.getName(),
                    meeting.getMeetingDate(), meeting.getLocation());
            if (!member.getId().equals(organizer.getId())) {
                notificationService.notifyUser(member.getId(),
                        "New meeting: " + saved.getTitle(),
                        notifMsg,
                        "MEETING_SCHEDULED", "MEETING", saved.getId(),
                        "/projects/" + project.getId() + "/meetings");
            }
        });

        // Also notify the project owner if they are not a member
        User owner = project.getOwner();
        if (owner != null && !owner.getId().equals(organizer.getId())
                && project.getMembers().stream().noneMatch(m -> m.getId().equals(owner.getId()))) {
            notificationService.notifyUser(owner.getId(),
                    "New meeting: " + saved.getTitle(),
                    notifMsg,
                    "MEETING_SCHEDULED", "MEETING", saved.getId(),
                    "/projects/" + project.getId() + "/meetings");
        }

        return toDTO(saved);
    }

    public MeetingDTO update(Long id, MeetingDTO dto) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));
        meeting.setTitle(dto.getTitle());
        meeting.setDescription(dto.getDescription());
        meeting.setMeetingDate(dto.getMeetingDate());
        meeting.setLocation(dto.getLocation());
        Meeting saved = meetingRepository.save(meeting);

        Long organizerId = saved.getOrganizer() != null ? saved.getOrganizer().getId() : null;
        activityLogService.log(organizerId, "UPDATED", "MEETING", saved.getId(),
                saved.getTitle(), saved.getProject().getId(), saved.getProject().getName());

        return toDTO(saved);
    }

    public void delete(Long id) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));
        Long organizerId = meeting.getOrganizer() != null ? meeting.getOrganizer().getId() : null;
        activityLogService.log(organizerId, "DELETED", "MEETING", meeting.getId(),
                meeting.getTitle(), meeting.getProject().getId(), meeting.getProject().getName());
        meetingRepository.deleteById(id);
    }

    private MeetingDTO toDTO(Meeting m) {
        MeetingDTO dto = new MeetingDTO();
        dto.setId(m.getId());
        dto.setTitle(m.getTitle());
        dto.setDescription(m.getDescription());
        dto.setMeetingDate(m.getMeetingDate());
        dto.setLocation(m.getLocation());
        dto.setMeetingLink(m.getMeetingLink());
        dto.setProjectId(m.getProject().getId());
        dto.setCreatedAt(m.getCreatedAt());
        if (m.getOrganizer() != null) {
            dto.setOrganizerId(m.getOrganizer().getId());
            dto.setOrganizerName(m.getOrganizer().getName());
        }
        return dto;
    }
}
