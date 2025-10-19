package com.utp.veterinaria.repository;

import com.utp.veterinaria.model.Cita;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CitaRepository extends JpaRepository<Cita, Long> {
    
}