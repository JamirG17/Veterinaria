package com.utp.veterinaria.controller;

import com.utp.veterinaria.dto.CitaDto;
import com.utp.veterinaria.dto.CitaResponseDto;
import com.utp.veterinaria.model.Cita;
import com.utp.veterinaria.service.CitaService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/citas")
public class CitaController {

    @Autowired
    private CitaService citaService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROL_ADMINISTRADOR', 'ROL_VETERINARIO', 'ROL_RECEPCIONISTA', 'ROL_GROOMING')")
    public ResponseEntity<List<CitaResponseDto>> obtenerTodas() {
        // Ahora llamamos al nuevo método que devuelve DTOs
        return ResponseEntity.ok(citaService.obtenerTodasComoDto());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROL_ADMINISTRADOR', 'ROL_RECEPCIONISTA')")
    public ResponseEntity<Cita> crearCita(@RequestBody CitaDto citaDto) {
        try {
            Cita nuevaCita = citaService.crearCita(citaDto);
            return new ResponseEntity<>(nuevaCita, HttpStatus.CREATED);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    // --- ENDPOINT ACTUALIZADO ---
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROL_ADMINISTRADOR', 'ROL_RECEPCIONISTA')")
    public ResponseEntity<Cita> actualizarCita(@PathVariable Long id, @RequestBody CitaDto citaDto) {
        try {
            Cita citaActualizada = citaService.actualizarCita(id, citaDto);
            return ResponseEntity.ok(citaActualizada);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // --- ENDPOINT NUEVO PARA CAMBIAR ESTADO ---
    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyAuthority('ROL_ADMINISTRADOR', 'ROL_RECEPCIONISTA', 'ROL_VETERINARIO', 'ROL_GROOMING')")
    public ResponseEntity<Cita> actualizarEstado(@PathVariable Long id, @RequestBody Map<String, String> estadoMap) {
        try {
            String nuevoEstado = estadoMap.get("estado");
            Cita citaActualizada = citaService.actualizarEstado(id, nuevoEstado);
            return ResponseEntity.ok(citaActualizada);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROL_ADMINISTRADOR', 'ROL_RECEPCIONISTA')")
    public ResponseEntity<Void> eliminarCita(@PathVariable Long id) {
        try {
            citaService.eliminarCita(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROL_ADMINISTRADOR', 'ROL_VETERINARIO', 'ROL_RECEPCIONISTA', 'ROL_GROOMING')")
    public ResponseEntity<CitaResponseDto> obtenerPorId(@PathVariable Long id) {
        try {
            CitaResponseDto citaDto = citaService.obtenerDtoPorId(id);
            return ResponseEntity.ok(citaDto);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    
    @GetMapping("/groomer/agenda")
    @PreAuthorize("hasAnyAuthority('ROL_GROOMING', 'ROL_ADMINISTRADOR')")
    public ResponseEntity<List<CitaResponseDto>> getAgendaGroomerHoy() {
        return ResponseEntity.ok(citaService.findCitasDeHoyParaGroomerLogueado());
    }

    @GetMapping("/mascota/{mascotaId}/historial-grooming")
    @PreAuthorize("hasAnyAuthority('ROL_GROOMING', 'ROL_ADMINISTRADOR')")
    public ResponseEntity<List<CitaResponseDto>> getHistorialGrooming(@PathVariable Long mascotaId) {
        return ResponseEntity.ok(citaService.findHistorialGroomingParaMascota(mascotaId));
    }

    @PatchMapping("/{citaId}/notas-grooming")
    @PreAuthorize("hasAnyAuthority('ROL_GROOMING', 'ROL_ADMINISTRADOR')")
    public ResponseEntity<Cita> guardarNotasGrooming(@PathVariable Long citaId, @RequestBody Map<String, String> payload) {
        String notas = payload.get("notas");
        Cita citaActualizada = citaService.guardarNotasGrooming(citaId, notas);
        return ResponseEntity.ok(citaActualizada);
    }

        // --- ENDPOINT NUEVO PARA HISTORIAL DE GROOMING ---
    @GetMapping("/historial/grooming")
    @PreAuthorize("hasAnyAuthority('ROL_ADMINISTRADOR', 'ROL_GROOMING')")
    public ResponseEntity<List<CitaResponseDto>> getHistorialGrooming() {
        return ResponseEntity.ok(citaService.findHistorialGroomingCompleto());
    }

        // --- ENDPOINT NUEVO PARA LA AGENDA DEL VETERINARIO ---
    @GetMapping("/veterinario/agenda")
    @PreAuthorize("hasAnyAuthority('ROL_VETERINARIO', 'ROL_ADMINISTRADOR')")
    public ResponseEntity<List<CitaResponseDto>> getAgendaVeterinarioHoy() {
        return ResponseEntity.ok(citaService.findCitasDeHoyParaVeterinarioLogueado());
    }
}
