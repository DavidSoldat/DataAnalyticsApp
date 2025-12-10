package com.example.backend.model;

import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

public class CustomUserDetails extends User {

    private final Long userId;
    private final String email;

    public CustomUserDetails(String email, Long userId, Collection<? extends GrantedAuthority> authorities) {
        super(email, "", authorities);
        this.email = email;
        this.userId = userId;
    }

    public Long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }
}