package com.smartcampus.repository;

import com.smartcampus.model.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByRequestedBy(User user);
    List<Booking> findByStatus(BookingStatus status);
    List<Booking> findByResourceAndBookingDate(Resource resource, LocalDate bookingDate);
    List<Booking> findByResourceAndBookingDateAndStatusIn(Resource resource, LocalDate bookingDate, List<BookingStatus> statuses);
}
