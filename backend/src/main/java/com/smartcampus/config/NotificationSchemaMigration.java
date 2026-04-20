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
public class NotificationSchemaMigration implements CommandLineRunner {
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        Integer typeColumnCount = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = 'NOTIFICATIONS'
                  AND COLUMN_NAME = 'TYPE'
                """,
                Integer.class
        );

        if (typeColumnCount == null || typeColumnCount == 0) {
            log.info("Adding type column to notifications table");
            jdbcTemplate.execute("ALTER TABLE notifications ADD COLUMN type VARCHAR(20) DEFAULT 'GENERAL'");
        }

        jdbcTemplate.execute("""
                UPDATE notifications
                SET type = CASE
                    WHEN LOWER(COALESCE(title, '') || ' ' || COALESCE(message, '')) LIKE '%booking%' THEN 'BOOKING'
                    WHEN LOWER(COALESCE(title, '') || ' ' || COALESCE(message, '')) LIKE '%ticket%' THEN 'TICKET'
                    ELSE 'GENERAL'
                END
                WHERE type IS NULL OR TRIM(type) = ''
                """);
    }
}
