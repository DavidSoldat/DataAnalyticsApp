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


        if (path.startsWith("/api/auth") || path.startsWith("/api/oauth2")) {
            filterChain.doFilter(request, response);
            return;
        }

        String accessToken = getCookieValue(request, "token");
        String refreshToken = getCookieValue(request, "refreshToken");

        try {
            boolean authenticated = false;

            if (StringUtils.hasText(accessToken) && tokenGenerator.validateToken(accessToken)) {
                authenticateUserFromToken(accessToken, request);
                authenticated = true;
            } else if (StringUtils.hasText(refreshToken) && tokenGenerator.validateRefreshToken(refreshToken)) {
                Claims refreshClaims = tokenGenerator.getClaimsFromToken(refreshToken);
                String email = refreshClaims.getSubject();
                Long userId = refreshClaims.get("userId", Long.class);
                List<String> roles = refreshClaims.get("roles", List.class);

                String newAccessToken = tokenGenerator.generateAccessToken(email, userId, roles, true);

                Cookie newTokenCookie = new Cookie("token", newAccessToken);
                newTokenCookie.setHttpOnly(true);
                newTokenCookie.setSecure(false);
                newTokenCookie.setPath("/");
                newTokenCookie.setMaxAge(15 * 60);
                response.addCookie(newTokenCookie);

                authenticateUserFromToken(newAccessToken, request);
                authenticated = true;
            }

            if (!authenticated) {
                logger.warn("No valid token for request: {}", path);
            }

        } catch (JwtException ex) {
            logger.error("JWT validation failed: {}", ex.getMessage());
        }

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