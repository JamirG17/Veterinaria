package com.utp.veterinaria.service;

import com.utp.veterinaria.dto.CitaResponseDto;
import com.utp.veterinaria.dto.PacienteDetalleDto;
import com.utp.veterinaria.dto.PropietarioSimpleDto;
import com.utp.veterinaria.model.Cita;
import com.utp.veterinaria.model.HistoriaClinica;
import com.utp.veterinaria.model.Mascota;
import com.utp.veterinaria.model.Propietario;
import com.utp.veterinaria.repository.CitaRepository;
import com.utp.veterinaria.repository.HistoriaClinicaRepository;
import com.utp.veterinaria.repository.MascotaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PacienteService {

    @Autowired
    private MascotaRepository mascotaRepository;

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private CitaService citaService; // Reutilizamos la lógica de mapeo

    @Autowired
    private HistoriaClinicaRepository historiaClinicaRepository; 

    public PacienteDetalleDto getDetalleCompleto(Long mascotaId) {
        Mascota mascota = mascotaRepository.findById(mascotaId)
                .orElseThrow(() -> new EntityNotFoundException("Mascota no encontrada"));

        // --- LÓGICA CORREGIDA ---
        // Ahora obtenemos los registros reales de la tabla HistoriaClinica
        List<HistoriaClinica> historialClinico = historiaClinicaRepository.findAll().stream()
                .filter(h -> h.getMascota().getId().equals(mascotaId))
                .sorted(Comparator.comparing(HistoriaClinica::getFecha).reversed())
                .collect(Collectors.toList());

        List<Cita> todasLasCitas = citaRepository.findAll().stream()
                .filter(c -> c.getMascota().getId().equals(mascotaId))
                .collect(Collectors.toList());

        List<CitaResponseDto> historialGrooming = todasLasCitas.stream()
                .filter(c -> c.getArea().equals("GROOMING") && c.getEstado().equals("COMPLETADA"))
                .sorted(Comparator.comparing(Cita::getFechaHora).reversed())
                .map(citaService::mapToCitaResponseDto)
                .collect(Collectors.toList());
        
        List<CitaResponseDto> proximasCitas = todasLasCitas.stream()
                .filter(c -> c.getFechaHora().isAfter(LocalDateTime.now()) && c.getEstado().equals("PROGRAMADA"))
                .sorted(Comparator.comparing(Cita::getFechaHora))
                .map(citaService::mapToCitaResponseDto)
                .collect(Collectors.toList());

        PacienteDetalleDto detalleDto = new PacienteDetalleDto();
        detalleDto.setMascota(mascota);
        detalleDto.setHistorialClinico(historialClinico); // Asignamos la lista correcta
        detalleDto.setHistorialGrooming(historialGrooming);
        detalleDto.setProximasCitas(proximasCitas);
                // --- LÍNEA AÑADIDA ---
        // También incluimos las prevenciones
        detalleDto.setPrevenciones(mascota.getPrevenciones());

        if (mascota.getPropietario() != null) {
            Propietario p = mascota.getPropietario();
            PropietarioSimpleDto pDto = new PropietarioSimpleDto();
            pDto.setId(p.getId());
            pDto.setNombre(p.getNombre());
            pDto.setApellido(p.getApellido());
            pDto.setDni(p.getDni());
            pDto.setTelefono(p.getTelefono());
            pDto.setEmail(p.getEmail());
            detalleDto.setPropietario(pDto);
        }

        return detalleDto;
    }
}
