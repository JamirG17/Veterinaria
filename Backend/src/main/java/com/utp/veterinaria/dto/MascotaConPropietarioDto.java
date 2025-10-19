package com.utp.veterinaria.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class MascotaConPropietarioDto {
    private Long id;
    private String nombre;
    private String raza;
    private LocalDate fechaNacimiento;
    private Double peso;
    private PropietarioSimpleDto propietario;

    // --- CAMPOS AÑADIDOS ---
    private String sexo;
    private boolean esterilizado;
}

