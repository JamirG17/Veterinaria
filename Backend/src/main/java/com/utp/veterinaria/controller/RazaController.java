package com.utp.veterinaria.controller;

import com.utp.veterinaria.model.Raza;
import com.utp.veterinaria.service.RazaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/razas")
public class RazaController {

    @Autowired
    private RazaService razaService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROL_ADMINISTRADOR', 'ROL_RECEPCIONISTA')")
    public ResponseEntity<List<Raza>> obtenerTodas() {
        return ResponseEntity.ok(razaService.obtenerTodas());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROL_ADMINISTRADOR', 'ROL_RECEPCIONISTA')")
    public ResponseEntity<Raza> crearRaza(@RequestBody Raza raza) {
        Raza nuevaRaza = razaService.crearRaza(raza);
        return new ResponseEntity<>(nuevaRaza, HttpStatus.CREATED);
    }
}
