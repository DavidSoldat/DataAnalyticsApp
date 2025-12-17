package com.example.backend.dto.datasets;

import com.example.backend.model.AuthProvider;
import lombok.Data;

@Data
public class UserProfileResponse {
    private Long id;
    private String name;
    private String email;
    private String imageUrl;
    private AuthProvider provider;
    private String datasetPreferences;
    private String notificationsPreferences;

}
