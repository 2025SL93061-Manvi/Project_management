package com.enterprisepm.controller;

import com.enterprisepm.dto.CalendarEventDTO;
import com.enterprisepm.model.Holiday;
import com.enterprisepm.service.CalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping("/holidays")
    public ResponseEntity<List<Holiday>> getAllHolidays() {
        return ResponseEntity.ok(calendarService.getAllHolidays());
    }

    @PostMapping("/holidays")
    public ResponseEntity<Holiday> addHoliday(@RequestBody Holiday holiday) {
        return ResponseEntity.ok(calendarService.addHoliday(holiday));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/holidays/{id}")
    public ResponseEntity<String> deleteHoliday(@PathVariable Long id) {
        calendarService.deleteHoliday(id);
        return ResponseEntity.ok("Holiday deleted");
    }

    @GetMapping("/events")
    public ResponseEntity<List<CalendarEventDTO>> getAllEvents() {
        return ResponseEntity.ok(calendarService.getAllEvents());
    }
}
