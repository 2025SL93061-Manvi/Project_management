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
        Meeting saved = meetingRepository.save(meeting);
        project.getMembers().forEach(member ->
            emailService.sendMeetingNotificationEmail(
                member.getEmail(), member.getName(),
                meeting.getTitle(), project.getName(),
                meeting.getMeetingDate(), meeting.getLocation())
        );
        return toDTO(saved);
    }

    public MeetingDTO update(Long id, MeetingDTO dto) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));
        meeting.setTitle(dto.getTitle());
        meeting.setDescription(dto.getDescription());
        meeting.setMeetingDate(dto.getMeetingDate());
        meeting.setLocation(dto.getLocation());
        return toDTO(meetingRepository.save(meeting));
    }

    public void delete(Long id) {
        meetingRepository.deleteById(id);
    }

    private MeetingDTO toDTO(Meeting m) {
        MeetingDTO dto = new MeetingDTO();
        dto.setId(m.getId());
        dto.setTitle(m.getTitle());
        dto.setDescription(m.getDescription());
        dto.setMeetingDate(m.getMeetingDate());
        dto.setLocation(m.getLocation());
        dto.setProjectId(m.getProject().getId());
        dto.setCreatedAt(m.getCreatedAt());
        if (m.getOrganizer() != null) {
            dto.setOrganizerId(m.getOrganizer().getId());
            dto.setOrganizerName(m.getOrganizer().getName());
        }
        return dto;
    }
}
