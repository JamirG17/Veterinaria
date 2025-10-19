package com.utp.veterinaria.dto;

import lombok.Data;

@Data
public class PropietarioDto {
    private String nombre;
    private String apellido;
    private String dni; // <-- CAMPO AÑADIDO
    private String telefono;
    private String email;
}
