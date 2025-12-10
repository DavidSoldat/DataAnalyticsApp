package com.example.backend.dto;

import lombok.Data;

@Data
public class UserPreferencesRequest {
    private String datasetPrefsJson;
    private String notificationPrefsJson;
}
