package com.utp.veterinaria.controller;

import com.utp.veterinaria.dto.PacienteDetalleDto;
import com.utp.veterinaria.service.PacienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/pacientes")
public class PacienteController {

    @Autowired
    private PacienteService pacienteService;

    @GetMapping("/{mascotaId}/detalle")
    @PreAuthorize("hasAnyAuthority('ROL_VETERINARIO', 'ROL_ADMINISTRADOR')")
    public ResponseEntity<PacienteDetalleDto> getDetalleCompleto(@PathVariable Long mascotaId) {
        return ResponseEntity.ok(pacienteService.getDetalleCompleto(mascotaId));
    }
}
