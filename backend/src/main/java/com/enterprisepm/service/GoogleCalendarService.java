package com.enterprisepm.service;

import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.ConferenceData;
import com.google.api.services.calendar.model.CreateConferenceRequest;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleCalendarService {

    private final Calendar googleCalendarClient;

    /**
     * Creates a Google Calendar event with a Meet link and returns the hangout link.
     * Returns null if creation fails (so the meeting is still saved without a link).
     */
    public String createMeetLink(String title, String description, LocalDateTime startTime) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
            ZoneId zone = ZoneId.systemDefault();

            EventDateTime start = new EventDateTime()
                    .setDateTime(new DateTime(startTime.format(formatter)))
                    .setTimeZone(zone.getId());

            EventDateTime end = new EventDateTime()
                    .setDateTime(new DateTime(startTime.plusHours(1).format(formatter)))
                    .setTimeZone(zone.getId());

            Event event = new Event()
                    .setSummary(title)
                    .setDescription(description)
                    .setStart(start)
                    .setEnd(end)
                    .setConferenceData(new ConferenceData()
                            .setCreateRequest(new CreateConferenceRequest()
                                    .setRequestId(UUID.randomUUID().toString())
                                    .setConferenceSolutionKey(
                                            new com.google.api.services.calendar.model.ConferenceSolutionKey()
                                                    .setType("hangoutsMeet"))));

            Event created = googleCalendarClient.events()
                    .insert("primary", event)
                    .setConferenceDataVersion(1)
                    .execute();

            return created.getHangoutLink();
        } catch (Exception e) {
            log.error("Failed to create Google Meet link for meeting '{}': {}", title, e.getMessage());
            return null;
        }
    }
}
