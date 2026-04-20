package com.smartcampus.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Order(0)
@Slf4j
public class BookingSchemaMigration implements CommandLineRunner {
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        Integer columnCount = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = 'BOOKINGS'
                  AND COLUMN_NAME = 'HIDDEN_FROM_HISTORY'
                """,
                Integer.class
        );

        if (columnCount != null && columnCount > 0) {
            jdbcTemplate.execute("UPDATE bookings SET hidden_from_history = FALSE WHERE hidden_from_history IS NULL");
            return;
        }

        log.info("Adding hidden_from_history column to bookings table");
        jdbcTemplate.execute("ALTER TABLE bookings ADD COLUMN hidden_from_history BOOLEAN DEFAULT FALSE");
        jdbcTemplate.execute("UPDATE bookings SET hidden_from_history = FALSE WHERE hidden_from_history IS NULL");
    }
}
