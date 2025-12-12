package com.utp.veterinaria.dto;

import lombok.Data;

@Data
public class AnalisisResponseDto {
    private String titulo;
    private String sintomas;
    private String diagnostico;
    private String tratamiento;
}