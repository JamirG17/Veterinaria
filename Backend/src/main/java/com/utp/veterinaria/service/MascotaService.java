package com.utp.veterinaria.service;

import com.utp.veterinaria.dto.MascotaConPropietarioDto;
import com.utp.veterinaria.dto.MascotaDto;
import com.utp.veterinaria.dto.PropietarioSimpleDto;
import com.utp.veterinaria.model.Mascota;
import com.utp.veterinaria.model.Propietario;
import com.utp.veterinaria.repository.MascotaRepository;
import com.utp.veterinaria.repository.PropietarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MascotaService {

    @Autowired
    private MascotaRepository mascotaRepository;

    @Autowired
    private PropietarioRepository propietarioRepository;

    public List<Mascota> obtenerTodas() {
        return mascotaRepository.findAll();
    }

    public Mascota obtenerPorId(Long id) {
        return mascotaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Mascota no encontrada con ID: " + id));
    }

    public Mascota crearMascota(MascotaDto mascotaDto) {
        Propietario propietario = propietarioRepository.findById(mascotaDto.getPropietarioId())
                .orElseThrow(() -> new EntityNotFoundException("Propietario no encontrado con ID: " + mascotaDto.getPropietarioId()));
        
        Mascota mascota = new Mascota();
        mascota.setNombre(mascotaDto.getNombre());
        mascota.setRaza(mascotaDto.getRaza());
        mascota.setSexo(mascotaDto.getSexo()); // <-- AÑADIDO
        mascota.setEsterilizado(mascotaDto.isEsterilizado()); // <-- AÑADIDO
        mascota.setFechaNacimiento(mascotaDto.getFechaNacimiento());
        mascota.setPeso(mascotaDto.getPeso());
        mascota.setPropietario(propietario);
        
        return mascotaRepository.save(mascota);
    }

    public Mascota actualizarMascota(Long id, MascotaDto mascotaDto) {
        Mascota mascotaExistente = obtenerPorId(id);
        
        Propietario propietario = propietarioRepository.findById(mascotaDto.getPropietarioId())
            .orElseThrow(() -> new EntityNotFoundException("Propietario no encontrado con ID: " + mascotaDto.getPropietarioId()));
        
        mascotaExistente.setNombre(mascotaDto.getNombre());
        mascotaExistente.setRaza(mascotaDto.getRaza());
        mascotaExistente.setSexo(mascotaDto.getSexo()); // <-- AÑADIDO
        mascotaExistente.setEsterilizado(mascotaDto.isEsterilizado()); // <-- AÑADIDO
        mascotaExistente.setFechaNacimiento(mascotaDto.getFechaNacimiento());
        mascotaExistente.setPeso(mascotaDto.getPeso());
        mascotaExistente.setPropietario(propietario);

        return mascotaRepository.save(mascotaExistente);
    }

    public void eliminarMascota(Long id) {
        Mascota mascota = obtenerPorId(id);
        mascotaRepository.delete(mascota);
    }

        // --- MÉTODO NUEVO PARA ACTUALIZAR ALERGIAS ---
    public Mascota actualizarAlergias(Long id, String alergias) {
        Mascota mascota = obtenerPorId(id);
        mascota.setAlergias(alergias);
        return mascotaRepository.save(mascota);
    }

        // --- NUEVO MÉTODO PARA DEVOLVER DTOs ---
    public List<MascotaConPropietarioDto> obtenerTodasComoDto() {
        return mascotaRepository.findAll().stream()
                .map(this::mapToMascotaConPropietarioDto)
                .collect(Collectors.toList());
    }

    // --- LÓGICA DE MAPEO REUTILIZABLE ---
    public MascotaConPropietarioDto mapToMascotaConPropietarioDto(Mascota mascota) {
        MascotaConPropietarioDto mascotaDto = new MascotaConPropietarioDto();
        mascotaDto.setId(mascota.getId());
        mascotaDto.setNombre(mascota.getNombre());
        mascotaDto.setRaza(mascota.getRaza());
        mascotaDto.setFechaNacimiento(mascota.getFechaNacimiento());
        mascotaDto.setPeso(mascota.getPeso());
        mascotaDto.setSexo(mascota.getSexo());
        mascotaDto.setEsterilizado(mascota.isEsterilizado());

        if (mascota.getPropietario() != null) {
            Propietario propietario = mascota.getPropietario();
            PropietarioSimpleDto propDto = new PropietarioSimpleDto();
            propDto.setId(propietario.getId());
            propDto.setNombre(propietario.getNombre());
            propDto.setApellido(propietario.getApellido());
            propDto.setDni(propietario.getDni());
            propDto.setTelefono(propietario.getTelefono());
            propDto.setEmail(propietario.getEmail());
            mascotaDto.setPropietario(propDto);
        }
        return mascotaDto;
    }
}
