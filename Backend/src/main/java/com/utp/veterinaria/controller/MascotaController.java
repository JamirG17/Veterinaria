package com.utp.veterinaria.controller;

import com.utp.veterinaria.dto.MascotaConPropietarioDto;
import com.utp.veterinaria.dto.MascotaDto;
import com.utp.veterinaria.model.Mascota;
import com.utp.veterinaria.service.MascotaService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mascotas")
public class MascotaController {

    @Autowired
    private MascotaService mascotaService;

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROL_ADMINISTRADOR', 'ROL_VETERINARIO', 'ROL_RECEPCIONISTA', 'ROL_GROOMING')")
    public ResponseEntity<Mascota> obtenerPorId(@PathVariable Long id) {
        try {
            Mascota mascota = mascotaService.obtenerPorId(id);
            return ResponseEntity.ok(mascota);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROL_ADMINISTRADOR', 'ROL_RECEPCIONISTA')")
    public ResponseEntity<Mascota> crearMascota(@RequestBody MascotaDto mascotaDto) {
        try {
            Mascota nuevaMascota = mascotaService.crearMascota(mascotaDto);
            return new ResponseEntity<>(nuevaMascota, HttpStatus.CREATED);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PutMapping("/{id}")
    // --- LÍNEA DE PRUEBA: Comentamos la seguridad de método temporalmente ---
    @PreAuthorize("hasAnyAuthority('ROL_ADMINISTRADOR', 'ROL_RECEPCIONISTA')")
    public ResponseEntity<Mascota> actualizarMascota(@PathVariable Long id, @RequestBody MascotaDto mascotaDto) {
        try {
            Mascota mascotaActualizada = mascotaService.actualizarMascota(id, mascotaDto);
            return ResponseEntity.ok(mascotaActualizada);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROL_ADMINISTRADOR')")
    public ResponseEntity<Void> eliminarMascota(@PathVariable Long id) {
        try {
            mascotaService.eliminarMascota(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

        // --- ENDPOINT NUEVO PARA ACTUALIZAR ALERGIAS ---
    @PatchMapping("/{id}/alergias")
    @PreAuthorize("hasAnyAuthority('ROL_VETERINARIO', 'ROL_ADMINISTRADOR')")
    public ResponseEntity<Mascota> actualizarAlergias(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Mascota mascotaActualizada = mascotaService.actualizarAlergias(id, payload.get("alergias"));
        return ResponseEntity.ok(mascotaActualizada);
    }

        // --- ENDPOINT ACTUALIZADO ---
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROL_ADMINISTRADOR', 'ROL_VETERINARIO', 'ROL_RECEPCIONISTA', 'ROL_GROOMING')")
    public ResponseEntity<List<MascotaConPropietarioDto>> obtenerTodas() {
        // Ahora llamamos al método que devuelve DTOs
        return ResponseEntity.ok(mascotaService.obtenerTodasComoDto());
    }
}
