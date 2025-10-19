package com.utp.veterinaria.controller;

import com.utp.veterinaria.model.Usuario;
import com.utp.veterinaria.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping("/veterinarios")
    @PreAuthorize("hasAnyAuthority('ROL_ADMINISTRADOR', 'ROL_RECEPCIONISTA')")
    public ResponseEntity<List<Usuario>> getVeterinarios() {
        return ResponseEntity.ok(usuarioService.findByRole("ROL_VETERINARIO"));
    }

    @GetMapping("/groomers")
    @PreAuthorize("hasAnyAuthority('ROL_ADMINISTRADOR', 'ROL_RECEPCIONISTA')")
    public ResponseEntity<List<Usuario>> getGroomers() {
        return ResponseEntity.ok(usuarioService.findByRole("ROL_GROOMING"));
    }
}
