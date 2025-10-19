package com.utp.veterinaria.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class MascotaDto {
    private String nombre;
    private String raza;
    private String sexo; // <-- AÑADIDO
    private boolean esterilizado; // <-- AÑADIDO
    private LocalDate fechaNacimiento;
    private Double peso;
    private Long propietarioId;
}

