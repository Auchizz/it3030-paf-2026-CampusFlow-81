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
public class TicketSchemaMigration implements CommandLineRunner {
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        Integer createdAtColumnCount = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = 'TICKETS'
                  AND COLUMN_NAME = 'CREATED_AT'
                """,
                Integer.class
        );

        if (createdAtColumnCount == null || createdAtColumnCount == 0) {
            log.info("Adding created_at column to tickets table");
            jdbcTemplate.execute("ALTER TABLE tickets ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
        }

        jdbcTemplate.execute("UPDATE tickets SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL");
    }
}
