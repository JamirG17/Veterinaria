package com.utp.veterinaria.dto;

import com.utp.veterinaria.model.HistoriaClinica;
import com.utp.veterinaria.model.Mascota;
import com.utp.veterinaria.model.Prevencion; // <-- IMPORTAMOS
import lombok.Data;
import java.util.List;

@Data
public class PacienteDetalleDto {
    private Mascota mascota;
    private PropietarioSimpleDto propietario;
    private List<HistoriaClinica> historialClinico;
    private List<CitaResponseDto> historialGrooming;
    private List<CitaResponseDto> proximasCitas;
    
    // --- CAMPO AÑADIDO ---
    private List<Prevencion> prevenciones; 
}

