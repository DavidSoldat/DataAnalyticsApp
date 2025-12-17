package com.example.backend.controller;

import com.example.backend.dto.auth.AuthResponse;
import com.example.backend.dto.auth.AuthTokensResponse;
import com.example.backend.dto.auth.LoginRequest;
import com.example.backend.dto.auth.RegisterRequest;
import com.example.backend.security.SecurityConstants;
import com.example.backend.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest request, HttpServletResponse response) {
        AuthTokensResponse tokensResponse = authService.registerWithTokens(request);

        Cookie accessCookie = new Cookie("token", tokensResponse.getAccessToken());
        accessCookie.setHttpOnly(true);
        accessCookie.setSecure(false);
        accessCookie.setPath("/");
        accessCookie.setMaxAge((int) (SecurityConstants.ACCESS_TOKEN_EXPIRATION / 1000));
        response.addCookie(accessCookie);

        Cookie refreshCookie = new Cookie("refreshToken", tokensResponse.getRefreshToken());
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(false);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge((int) (SecurityConstants.REFRESH_TOKEN_EXPIRATION / 1000));
        response.addCookie(refreshCookie);

        return new AuthResponse("User registered and logged in successfully", tokensResponse.getUser());
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request, HttpServletResponse response) {
        AuthTokensResponse tokensResponse = authService.loginWithTokens(request);

        Cookie accessCookie = new Cookie("token", tokensResponse.getAccessToken());
        accessCookie.setHttpOnly(true);
        accessCookie.setSecure(false);
        accessCookie.setPath("/");
        accessCookie.setMaxAge((int) (SecurityConstants.ACCESS_TOKEN_EXPIRATION / 1000));
        response.addCookie(accessCookie);

        if (tokensResponse.getRefreshToken() != null) {
            Cookie refreshCookie = new Cookie("refreshToken", tokensResponse.getRefreshToken());
            refreshCookie.setHttpOnly(true);
            refreshCookie.setSecure(false);
            refreshCookie.setPath("/");
            refreshCookie.setMaxAge((int) (SecurityConstants.REFRESH_TOKEN_EXPIRATION / 1000));
            response.addCookie(refreshCookie);
        }

        return new AuthResponse("Login successful", tokensResponse.getUser());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {

        log.info("Response: ",  response);

        Cookie accessToken = new Cookie("token", null);
        accessToken.setHttpOnly(true);
        accessToken.setSecure(false);
        accessToken.setPath("/");
        accessToken.setMaxAge(0);

        Cookie refreshToken = new Cookie("refreshToken", null);
        refreshToken.setHttpOnly(true);
        refreshToken.setSecure(false);
        refreshToken.setPath("/");
        refreshToken.setMaxAge(0);

        response.addCookie(accessToken);
        response.addCookie(refreshToken);

        return ResponseEntity.noContent().build();
    }
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        try {
            String refreshToken = null;
            if (request.getCookies() != null) {
                for (Cookie cookie : request.getCookies()) {
                    if ("refreshToken".equals(cookie.getName())) {
                        refreshToken = cookie.getValue();
                        break;
                    }
                }
            }

            if (refreshToken == null || refreshToken.isEmpty()) {
                return ResponseEntity.status(401).body("No refresh token found");
            }

            var tokensResponse = authService.refreshAccessToken(refreshToken);
            if (tokensResponse == null) {
                return ResponseEntity.status(401).body("Invalid or expired refresh token");
            }

            Cookie accessCookie = new Cookie("token", tokensResponse.getAccessToken());
            accessCookie.setHttpOnly(true);
            accessCookie.setSecure(false);
            accessCookie.setPath("/");
            accessCookie.setMaxAge((int) (SecurityConstants.ACCESS_TOKEN_EXPIRATION / 1000));
            response.addCookie(accessCookie);

            return ResponseEntity.ok(new AuthResponse("Access token refreshed", tokensResponse.getUser()));

        } catch (Exception e) {
            log.error("Error while refreshing token: {}", e.getMessage());
            return ResponseEntity.status(500).body("Error while refreshing token");
        }
    }
}
