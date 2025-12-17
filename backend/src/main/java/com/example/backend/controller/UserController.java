package com.example.backend.controller;

import com.example.backend.dto.auth.UserDTO;
import com.example.backend.dto.datasets.UserPreferencesRequest;
import com.example.backend.dto.datasets.UserProfileResponse;
import com.example.backend.model.CustomUserDetails;
import com.example.backend.model.User;
import com.example.backend.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {
    private final AuthService authService;

    public UserController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Not authenticated"));
        }

        String email = authentication.getName();

        try {
            UserDTO user = authService.getUserDTOByEmail(email);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        User user = authService.getById(currentUser.getUserId());

        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setName(user.getName());

        response.setDatasetPreferences(user.getDatasetPrefs());
        response.setNotificationsPreferences(user.getNotificationPrefs());

        return ResponseEntity.ok(response);
    }


    @PutMapping("/preferences")
    public ResponseEntity<?> updatePreferences(
            @RequestBody UserPreferencesRequest prefs,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        authService.updatePreferences(
                currentUser.getUserId(),
                prefs.getDatasetPrefsJson(),
                prefs.getNotificationPrefsJson()
        );

        return ResponseEntity.ok("Preferences updated.");
    }


    @DeleteMapping("/account")
    public ResponseEntity<?> deleteAccount(
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        authService.deleteAccount(currentUser.getUserId());
        return ResponseEntity.ok("Account deleted.");
    }
}