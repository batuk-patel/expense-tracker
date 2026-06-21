package com.expensetracker.util;

import java.util.Map;

public final class RequestUtil {

    private RequestUtil() {}

    public static Long extractTripId(Map<String, Object> body) {
        Object tripObj = body.get("trip");
        if (tripObj instanceof Map<?, ?> tripMap) {
            Object tripId = tripMap.get("id");
            if (tripId instanceof Number) {
                return ((Number) tripId).longValue();
            }
        }
        return null;
    }
}
