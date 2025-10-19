package com.utp.veterinaria.controller;

import com.utp.veterinaria.dto.HistoriaClinicaDto;
import com.utp.veterinaria.dto.HistoriaClinicaResponseDto;
import com.utp.veterinaria.model.HistoriaClinica;
import com.utp.veterinaria.service.HistoriaClinicaService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/historias-clinicas")
public class HistoriaClinicaController {

    @Autowired
    private HistoriaClinicaService historiaClinicaService;

    @GetMapping("/mascota/{mascotaId}")
    @PreAuthorize("hasAnyAuthority('ROL_ADMINISTRADOR', 'ROL_VETERINARIO')")
    public ResponseEntity<List<HistoriaClinica>> obtenerHistoriasPorMascotaId(@PathVariable Long mascotaId) {
        try {
            List<HistoriaClinica> historias = historiaClinicaService.obtenerHistoriasPorMascotaId(mascotaId);
            return ResponseEntity.ok(historias);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROL_ADMINISTRADOR', 'ROL_VETERINARIO')")
    public ResponseEntity<HistoriaClinica> obtenerPorId(@PathVariable Long id) {
        try {
            HistoriaClinica historia = historiaClinicaService.obtenerPorId(id);
            return ResponseEntity.ok(historia);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROL_ADMINISTRADOR', 'ROL_VETERINARIO')")
    public ResponseEntity<?> crearHistoriaClinica(@RequestBody HistoriaClinicaDto historiaDto) {
        try {
            HistoriaClinica nuevaHistoria = historiaClinicaService.crearHistoriaClinica(historiaDto);
            return new ResponseEntity<>(nuevaHistoria, HttpStatus.CREATED);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROL_ADMINISTRADOR', 'ROL_VETERINARIO')")
    public ResponseEntity<HistoriaClinica> actualizarHistoria(@PathVariable Long id, @RequestBody HistoriaClinicaDto historiaDto) {
        try {
            HistoriaClinica historiaActualizada = historiaClinicaService.actualizarHistoriaClinica(id, historiaDto);
            return ResponseEntity.ok(historiaActualizada);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROL_ADMINISTRADOR')")
    public ResponseEntity<Void> eliminarHistoria(@PathVariable Long id) {
        try {
            historiaClinicaService.eliminarHistoriaClinica(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

        // --- ENDPOINT ACTUALIZADO ---
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROL_VETERINARIO', 'ROL_ADMINISTRADOR')")
    public ResponseEntity<List<HistoriaClinicaResponseDto>> obtenerTodas() {
        // Ahora llamamos al método que devuelve DTOs
        return ResponseEntity.ok(historiaClinicaService.obtenerTodosComoDto());
    }
}

