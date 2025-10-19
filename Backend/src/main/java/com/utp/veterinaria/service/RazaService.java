package com.utp.veterinaria.service;

import com.utp.veterinaria.model.Raza;
import com.utp.veterinaria.repository.RazaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RazaService {

    @Autowired
    private RazaRepository razaRepository;

    public List<Raza> obtenerTodas() {
        return razaRepository.findAll();
    }

    public Raza crearRaza(Raza raza) {
        return razaRepository.save(raza);
    }
}
