package com.utp.veterinaria.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Cita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime fechaHora;
    private String motivo;
    private String estado; // Ej: "PROGRAMADA", "EN ESPERA", "EN PROGRESO", "COMPLETADA"

    private String area;
    private Long citaSiguienteId; // ID de la cita enlazada (si la hay)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mascota_id")
    private Mascota mascota;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario asignadoA;
    // --- NUEVO CAMPO AÑADIDO ---
    @Lob // Para textos largos
    private String notasGrooming;
}
