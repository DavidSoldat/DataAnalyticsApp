package com.example.backend.service;

import com.example.backend.dto.AuthTokensResponse;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.dto.UserDTO;
import com.example.backend.model.AuthProvider;
import com.example.backend.model.Role;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JWTTokenGenerator;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JWTTokenGenerator jwtTokenGenerator;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JWTTokenGenerator jwtTokenGenerator) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenGenerator = jwtTokenGenerator;
    }

    public AuthTokensResponse registerWithTokens(RegisterRequest request) {
        if(userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already in use");
        }
        if(!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(Set.of(Role.ROLE_USER))
                .provider(AuthProvider.LOCAL)
                .emailVerified(true)
                .build();

        userRepository.save(user);

        List<String> roles = user.getRoles().stream()
                .map(Role::name)
                .toList();

        Long userId = user.getId();

        String accessToken = jwtTokenGenerator.generateAccessToken(user.getEmail(), userId, roles);
        String refreshToken = jwtTokenGenerator.generateRefreshToken(user.getEmail(), userId, roles);

        return new AuthTokensResponse(mapToDTO(user), accessToken, refreshToken);
    }

    public AuthTokensResponse loginWithTokens(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<String> roles = user.getRoles().stream()
                .map(Role::name)
                .toList();

        Long userId = user.getId();

        String accessToken = jwtTokenGenerator.generateAccessToken(user.getEmail(), userId, roles);
        String refreshToken = null;
        if (request.isRememberMe()) {
            refreshToken = jwtTokenGenerator.generateRefreshToken(user.getEmail(), userId, roles);
        }

        return new AuthTokensResponse(mapToDTO(user), accessToken, refreshToken);
    }

    public static class Tokens {
        private final String accessToken;
        private final String refreshToken;

        public Tokens(String accessToken, String refreshToken) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
        }

        public String getAccessToken() { return accessToken; }
        public String getRefreshToken() { return refreshToken; }
    }

    public AuthTokensResponse refreshAccessToken(String refreshToken) {
        if (!jwtTokenGenerator.validateRefreshToken(refreshToken)) {
            return null;
        }

        var claims = jwtTokenGenerator.getClaimsFromToken(refreshToken);

        String email = claims.getSubject();
        Long userId = claims.get("userId", Long.class);

        @SuppressWarnings("unchecked")
        List<String> roles = claims.get("roles", List.class);

        String newAccessToken = jwtTokenGenerator.generateAccessToken(email, userId, roles);

        UserDTO user = getUserDTOByEmail(email);

        return new AuthTokensResponse(user, newAccessToken, null);
    }

    public UserDTO getUserDTOByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return mapToDTO(user);
    }

    private UserDTO mapToDTO(User user) {
        return new UserDTO(user.getName(), user.getEmail(), user.getRoles());
    }

    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public void deleteAccount(Long userId) {
        userRepository.deleteById(userId);
    }

    public void updatePreferences(Long userId, String datasetPrefsJson, String notificationPrefsJson) {
        User user = getById(userId);

        user.setDatasetPrefs(datasetPrefsJson);
        user.setNotificationPrefs(notificationPrefsJson);

        userRepository.save(user);
    }

}
