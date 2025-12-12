package com.utp.veterinaria.controller;

import com.utp.veterinaria.dto.AnalisisRequestDto;
import com.utp.veterinaria.dto.AnalisisResponseDto;
import com.utp.veterinaria.service.IAService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ia")
public class IAController {

    @Autowired
    private IAService iaService;

    @PostMapping("/analizar-texto")
    @PreAuthorize("hasAnyAuthority('ROL_VETERINARIO', 'ROL_ADMINISTRADOR')")
    public ResponseEntity<AnalisisResponseDto> analizar(@RequestBody AnalisisRequestDto request) {
        AnalisisResponseDto response = iaService.analizarTexto(request.getTexto());
        return ResponseEntity.ok(response);
    }
}