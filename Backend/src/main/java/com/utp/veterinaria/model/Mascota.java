package com.utp.veterinaria.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Entity
@Data
public class Mascota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String raza; // Se mantiene como String para flexibilidad

    // --- NUEVOS CAMPOS AÑADIDOS ---
    private String sexo; // "MACHO" o "HEMBRA"
    private boolean esterilizado;

    private LocalDate fechaNacimiento;
    private Double peso;

    @Lob // Para textos largos
    private String alergias;

    @OneToMany(mappedBy = "mascota", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Prevencion> prevenciones;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "propietario_id")
    @JsonBackReference
    private Propietario propietario;
}

