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
public class ResourceSchemaMigration implements CommandLineRunner {
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        Integer columnCount = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = 'RESOURCES'
                  AND COLUMN_NAME = 'AVAILABILITY_WINDOW'
                """,
                Integer.class
        );

        if (columnCount == null || columnCount == 0) {
            return;
        }

        log.info("Dropping legacy availability_window column from resources table");
        jdbcTemplate.execute("ALTER TABLE resources DROP COLUMN availability_window");
    }
}
