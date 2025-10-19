package com.utp.veterinaria.controller;

import com.utp.veterinaria.model.Prevencion;
import com.utp.veterinaria.service.PrevencionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/prevenciones")
public class PrevencionController {

    @Autowired
    private PrevencionService prevencionService;

    @PostMapping("/mascota/{mascotaId}")
    @PreAuthorize("hasAnyAuthority('ROL_VETERINARIO', 'ROL_ADMINISTRADOR')")
    public ResponseEntity<Prevencion> addPrevencion(@PathVariable Long mascotaId, @RequestBody Prevencion prevencion) {
        Prevencion nuevaPrevencion = prevencionService.addPrevencion(mascotaId, prevencion);
        return new ResponseEntity<>(nuevaPrevencion, HttpStatus.CREATED);
    }

    @DeleteMapping("/{prevencionId}")
    @PreAuthorize("hasAnyAuthority('ROL_VETERINARIO', 'ROL_ADMINISTRADOR')")
    public ResponseEntity<Void> deletePrevencion(@PathVariable Long prevencionId) {
        prevencionService.deletePrevencion(prevencionId);
        return ResponseEntity.noContent().build();
    }
}
