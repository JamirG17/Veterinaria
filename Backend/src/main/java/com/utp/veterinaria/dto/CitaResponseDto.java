package com.utp.veterinaria.dto;

import com.utp.veterinaria.model.Usuario;
import lombok.Data;
import java.time.LocalDateTime;

// El DTO final que se enviará al frontend.
@Data
public class CitaResponseDto {
    private Long id;
    private LocalDateTime fechaHora;
    private String motivo;
    private String estado;
    private String area;
    private MascotaConPropietarioDto mascota;
    private Usuario asignadoA;
    private Long citaSiguienteId; 
}
