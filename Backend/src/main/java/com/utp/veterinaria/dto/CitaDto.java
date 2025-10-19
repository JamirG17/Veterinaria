package com.utp.veterinaria.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CitaDto {
    private Long id;
    private LocalDateTime fechaHora;
    private String motivo;
    private String estado;
    private Long mascotaId;
    private Long asignadoAId;
    
    // --- CAMPOS NUEVOS ---
    private String area; // "VETERINARIA", "GROOMING", o "AMBOS"
    private Long asignadoAGroomingId; // ID del groomer si se selecciona "AMBOS"
}
