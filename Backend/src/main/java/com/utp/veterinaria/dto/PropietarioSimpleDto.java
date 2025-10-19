package com.utp.veterinaria.dto;

import lombok.Data;

// Un DTO simple para el propietario, sin la lista de mascotas para evitar bucles.
@Data
public class PropietarioSimpleDto {
    private Long id;
    private String nombre;
    private String apellido;
    private String dni;
    private String telefono;
    private String email;
}
