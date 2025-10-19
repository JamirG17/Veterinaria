package com.utp.veterinaria.dto;

import com.utp.veterinaria.model.Usuario;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class HistoriaClinicaResponseDto {
    private Long id;
    private LocalDateTime fecha;
    private String sintomas;
    private String diagnostico;
    private String tratamiento;
    private MascotaConPropietarioDto mascota;
    private Usuario veterinario;
}
