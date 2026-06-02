package com.enterprisepm.repository;

import com.enterprisepm.model.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HolidayRepository extends JpaRepository<Holiday, Long> {

    @Query("SELECT h FROM Holiday h WHERE YEAR(h.holidayDate) = :year")
    List<Holiday> findByHolidayDateYear(@Param("year") int year);
}
