package com.utp.veterinaria.controller;

import com.utp.veterinaria.dto.PropietarioDto;
import com.utp.veterinaria.model.Propietario;
import com.utp.veterinaria.service.PropietarioService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/propietarios")
public class PropietarioController {

    @Autowired
    private PropietarioService propietarioService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROL_ADMINISTRADOR', 'ROL_VETERINARIO', 'ROL_RECEPCIONISTA')")
    public ResponseEntity<List<Propietario>> obtenerTodos() {
        return ResponseEntity.ok(propietarioService.obtenerTodos());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROL_ADMINISTRADOR', 'ROL_VETERINARIO', 'ROL_RECEPCIONISTA')")
    public ResponseEntity<Propietario> obtenerPorId(@PathVariable Long id) {
        try {
            Propietario propietario = propietarioService.obtenerPorId(id);
            return ResponseEntity.ok(propietario);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROL_ADMINISTRADOR', 'ROL_RECEPCIONISTA')")
    public ResponseEntity<Propietario> crearPropietario(@RequestBody PropietarioDto propietarioDto) {
        Propietario nuevoPropietario = propietarioService.crearPropietario(propietarioDto);
        return new ResponseEntity<>(nuevoPropietario, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROL_ADMINISTRADOR', 'ROL_RECEPCIONISTA')")
    public ResponseEntity<Propietario> actualizarPropietario(@PathVariable Long id, @RequestBody PropietarioDto propietarioDto) {
        try {
            Propietario propietarioActualizado = propietarioService.actualizarPropietario(id, propietarioDto);
            return ResponseEntity.ok(propietarioActualizado);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROL_ADMINISTRADOR')")
    public ResponseEntity<Void> eliminarPropietario(@PathVariable Long id) {
        try {
            propietarioService.eliminarPropietario(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}