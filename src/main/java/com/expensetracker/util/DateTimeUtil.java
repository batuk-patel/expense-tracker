package com.expensetracker.util;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public final class DateTimeUtil {

    private static final ZoneId APP_ZONE = ZoneId.of("Asia/Kolkata");

    private DateTimeUtil() {}

    public static LocalDateTime now() {
        return LocalDateTime.now(APP_ZONE);
    }

    public static LocalDateTime parse(Object value) {
        if (value == null) {
            return now();
        }
        String str = value.toString().trim();
        if (str.isEmpty()) {
            return now();
        }
        try {
            if (str.endsWith("Z") || str.matches(".*[+-]\\d{2}:\\d{2}$")) {
                return Instant.parse(str).atZone(APP_ZONE).toLocalDateTime();
            }
            if (str.contains("T")) {
                return LocalDateTime.parse(str, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            }
        } catch (DateTimeParseException ignored) {
            // fall through to now()
        }
        return now();
    }
}
