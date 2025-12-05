package com.example.backend.dto;


import com.example.backend.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Set;

@Data
@AllArgsConstructor
public class UserDTO {
    private String name;
    private String email;
    private Set<Role> roles;
}
