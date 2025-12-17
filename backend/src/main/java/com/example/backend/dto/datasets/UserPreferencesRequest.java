package com.example.backend.dto.datasets;

import lombok.Data;

@Data
public class UserPreferencesRequest {
    private String datasetPrefsJson;
    private String notificationPrefsJson;
}
