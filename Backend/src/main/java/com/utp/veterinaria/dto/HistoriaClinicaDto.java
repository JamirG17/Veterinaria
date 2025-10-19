package com.utp.veterinaria.dto;

import lombok.Data;

@Data
public class HistoriaClinicaDto {
    private String sintomas;
    private String diagnostico;
    private String tratamiento;
    private Long mascotaId;
    private Long veterinarioId;
}