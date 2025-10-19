package com.utp.veterinaria.dto;

import lombok.Data;
import java.util.Set;

@Data
public class RegistroDto {
    private String username;
    private String password;
    private Set<String> roles;
}