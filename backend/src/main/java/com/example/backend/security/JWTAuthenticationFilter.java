package com.example.backend.security;

import com.example.backend.model.CustomUserDetails;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.logging.Level;
import java.util.stream.Collectors;

@Component
public class JWTAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JWTAuthenticationFilter.class);

    private final JWTTokenGenerator tokenGenerator;

    public JWTAuthenticationFilter(JWTTokenGenerator tokenGenerator) {
        this.tokenGenerator = tokenGenerator;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        if (path.startsWith("/api/auth/login") ||
                path.startsWith("/api/auth/register") ||
                path.startsWith("/api/auth/refresh") ||
                path.startsWith("/api/oauth2")) {
            filterChain.doFilter(request, response);
            return;
        }

        String accessToken = getCookieValue(request, "token");
        String refreshToken = getCookieValue(request, "refreshToken");

        try {
            if (StringUtils.hasText(accessToken) && tokenGenerator.validateToken(accessToken)) {
                logger.info("Access token is valid, authenticating user");
                authenticateUserFromToken(accessToken, request);
                logger.info("Authentication set: {}");
            } else if (StringUtils.hasText(refreshToken) && tokenGenerator.validateRefreshToken(refreshToken)) {
                logger.info("Access token invalid/missing, using refresh token");
                Claims refreshClaims = tokenGenerator.getClaimsFromToken(refreshToken);
                String email = refreshClaims.getSubject();
                Long userId = refreshClaims.get("userId", Long.class); // Get userId
                List<String> roles = refreshClaims.get("roles", List.class);

                String newAccessToken = tokenGenerator.generateAccessToken(email, userId, roles);

                Cookie newTokenCookie = new Cookie("token", newAccessToken);
                newTokenCookie.setHttpOnly(true);
                newTokenCookie.setSecure(false);
                newTokenCookie.setPath("/");
                newTokenCookie.setMaxAge(15 * 60);
                response.addCookie(newTokenCookie);

                authenticateUserFromToken(newAccessToken, request);
                logger.info("New access token generated and authentication set");
            } else {
                logger.error("No valid tokens found");
            }
        } catch (JwtException ex) {
            logger.error("JWT validation failed: {}", ex.getMessage(), ex);
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        logger.info("Final authentication before filter chain: {}");

        filterChain.doFilter(request, response);
    }

    private void authenticateUserFromToken(String token, HttpServletRequest request) {
        Claims claims = tokenGenerator.getClaimsFromToken(token);
        String email = claims.getSubject();
        Long userId = claims.get("userId", Long.class); // Extract userId
        List<String> roles = claims.get("roles", List.class);

        Collection<GrantedAuthority> authorities = roles.stream()
                .map(role -> new SimpleGrantedAuthority(role.startsWith("ROLE_") ? role : "ROLE_" + role))
                .collect(Collectors.toSet());

        // Use CustomUserDetails instead of UsernamePasswordAuthenticationToken
        CustomUserDetails userDetails = new CustomUserDetails(email, userId, authorities);

        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
        authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
    }

    private String getCookieValue(HttpServletRequest request, String name) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (name.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}