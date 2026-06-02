package com.enterprisepm.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class HolidayDTO {
    private Long id;
    private String name;
    private LocalDate holidayDate;
}
