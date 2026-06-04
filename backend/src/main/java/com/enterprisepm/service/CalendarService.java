package com.enterprisepm.service;

import com.enterprisepm.dto.CalendarEventDTO;
import com.enterprisepm.model.Holiday;
import com.enterprisepm.repository.HolidayRepository;
import com.enterprisepm.repository.MeetingRepository;
import com.enterprisepm.repository.MilestoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final HolidayRepository holidayRepository;
    private final MeetingRepository meetingRepository;
    private final MilestoneRepository milestoneRepository;

    public List<Holiday> getAllHolidays() {
        return holidayRepository.findAll();
    }

    public Holiday addHoliday(Holiday holiday) {
        return holidayRepository.save(holiday);
    }

    public void deleteHoliday(Long id) {
        holidayRepository.deleteById(id);
    }

    public List<CalendarEventDTO> getAllEvents() {
        List<CalendarEventDTO> meetings = meetingRepository.findAll().stream()
                .map(m -> new CalendarEventDTO(
                        m.getId(),
                        m.getTitle(),
                        m.getMeetingDate().toLocalDate().toString(),
                        "MEETING",
                        m.getProject().getName(),
                        m.getProject().getId(),
                        m.getMeetingLink()))
                .collect(Collectors.toList());

        List<CalendarEventDTO> milestones = milestoneRepository.findAll().stream()
                .filter(m -> m.getDueDate() != null)
                .map(m -> new CalendarEventDTO(
                        m.getId(),
                        m.getTitle(),
                        m.getDueDate().toString(),
                        "MILESTONE",
                        m.getProject().getName(),
                        m.getProject().getId(),
                        null))
                .collect(Collectors.toList());

        return Stream.concat(meetings.stream(), milestones.stream())
                .collect(Collectors.toList());
    }
}
