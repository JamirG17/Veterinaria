package com.utp.veterinaria.service;

import com.utp.veterinaria.dto.PropietarioDto;
import com.utp.veterinaria.model.Propietario;
import com.utp.veterinaria.repository.PropietarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PropietarioService {

    @Autowired
    private PropietarioRepository propietarioRepository;

    public List<Propietario> obtenerTodos() {
        return propietarioRepository.findAll();
    }

    public Propietario obtenerPorId(Long id) {
        return propietarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Propietario no encontrado con ID: " + id));
    }

    public Propietario crearPropietario(PropietarioDto propietarioDto) {
        Propietario propietario = new Propietario();
        propietario.setNombre(propietarioDto.getNombre());
        propietario.setApellido(propietarioDto.getApellido());
        propietario.setDni(propietarioDto.getDni()); // <-- LÍNEA AÑADIDA
        propietario.setTelefono(propietarioDto.getTelefono());
        propietario.setEmail(propietarioDto.getEmail());
        return propietarioRepository.save(propietario);
    }

    public Propietario actualizarPropietario(Long id, PropietarioDto propietarioDto) {
        Propietario propietarioExistente = obtenerPorId(id);
        propietarioExistente.setNombre(propietarioDto.getNombre());
        propietarioExistente.setApellido(propietarioDto.getApellido());
        propietarioExistente.setDni(propietarioDto.getDni()); // <-- LÍNEA AÑADIDA
        propietarioExistente.setTelefono(propietarioDto.getTelefono());
        propietarioExistente.setEmail(propietarioDto.getEmail());
        return propietarioRepository.save(propietarioExistente);
    }

    public void eliminarPropietario(Long id) {
        Propietario propietario = obtenerPorId(id);
        propietarioRepository.delete(propietario);
    }
}
