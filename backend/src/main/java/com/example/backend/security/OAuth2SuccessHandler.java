package com.example.backend.security;

import com.example.backend.model.AuthProvider;
import com.example.backend.model.Role;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JWTTokenGenerator jwtTokenGenerator;
    private final UserRepository userRepository;

    public OAuth2SuccessHandler(JWTTokenGenerator jwtTokenGenerator, UserRepository userRepository) {
        this.jwtTokenGenerator = jwtTokenGenerator;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2AuthenticationToken oAuth2Token = (OAuth2AuthenticationToken) authentication;
        OAuth2User principal = oAuth2Token.getPrincipal();
        Map<String, Object> attributes = principal.getAttributes();
        String email = (String) attributes.get("email");

        if (email == null) {
            throw new AuthenticationCredentialsNotFoundException("Email not found in OAuth2 user attributes");
        }

        String name = (String) attributes.getOrDefault("name", "");
        String givenName = (String) attributes.getOrDefault("given_name", "");
        String familyName = (String) attributes.getOrDefault("family_name", "");

        String username = name.isBlank()
                ? ((givenName + " " + familyName).trim().isEmpty() ? email.split("@")[0] : (givenName + " " + familyName).trim())
                : name;

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .email(email)
                            .name(username)
                            .provider(AuthProvider.valueOf(oAuth2Token.getAuthorizedClientRegistrationId().toUpperCase()))
                            .roles(Set.of(Role.ROLE_USER)) // ✅ Updated for enum set
                            .emailVerified(true)
                            .build();
                    return userRepository.save(newUser);
                });

        List<String> roles = user.getRoles().stream()
                .map(Role::name)
                .toList();

        Long userId = user.getId();

        String accessToken = jwtTokenGenerator.generateAccessToken(email, userId, roles);
        String refreshToken = jwtTokenGenerator.generateRefreshToken(email, userId, roles);


        Cookie accessCookie = new Cookie("token", accessToken);
        accessCookie.setHttpOnly(true);
        accessCookie.setSecure(false); // ✅ set true in production with HTTPS
        accessCookie.setPath("/");
        accessCookie.setMaxAge((int) (SecurityConstants.ACCESS_TOKEN_EXPIRATION / 1000));
        response.addCookie(accessCookie);

        Cookie refreshCookie = new Cookie("refreshToken", refreshToken);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(false); // ✅ set true in production with HTTPS
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge((int) (SecurityConstants.REFRESH_TOKEN_EXPIRATION / 1000));
        response.addCookie(refreshCookie);

        getRedirectStrategy().sendRedirect(request, response, "http://localhost:5173/oauth-callback");
    }
}
