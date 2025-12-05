package com.example.backend.security;

public class SecurityConstants {
    public static final long JWT_EXPIRATION = 15 * 60 * 1000; // 15 minutes
    public static final long ACCESS_TOKEN_EXPIRATION = 15 * 60 * 1000; // 15 minutes
    public static final long REFRESH_TOKEN_EXPIRATION = 7 * 24 * 60 * 60 * 1000; // 7 days
    public static final int TOKEN_MAXAGE = 15 * 60; // For cookie max-age
}
