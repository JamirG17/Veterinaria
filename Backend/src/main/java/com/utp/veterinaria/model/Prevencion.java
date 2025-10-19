package com.utp.veterinaria.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
public class Prevencion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tipo; // VACUNA, DESPARASITACION_INT, DESPARASITACION_EXT
    private String producto; // Nombre de la vacuna o del producto
    private LocalDate fechaAplicacion;
    private LocalDate proximaFecha;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mascota_id")
    @JsonBackReference
    private Mascota mascota;
}
