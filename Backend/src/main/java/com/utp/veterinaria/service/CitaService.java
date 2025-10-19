package com.utp.veterinaria.service;

import com.utp.veterinaria.dto.CitaDto;
import com.utp.veterinaria.dto.CitaResponseDto;
import com.utp.veterinaria.dto.MascotaConPropietarioDto;
import com.utp.veterinaria.dto.PropietarioSimpleDto;
import com.utp.veterinaria.model.Cita;
import com.utp.veterinaria.model.Mascota;
import com.utp.veterinaria.model.Propietario;
import com.utp.veterinaria.model.Usuario;
import com.utp.veterinaria.repository.CitaRepository;
import com.utp.veterinaria.repository.MascotaRepository;
import com.utp.veterinaria.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CitaService {

    @Autowired
    private CitaRepository citaRepository;
    @Autowired
    private MascotaRepository mascotaRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<Cita> obtenerTodas() {
        return citaRepository.findAll();
    }

    public Cita obtenerPorId(Long id) {
        return citaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cita no encontrada con ID: " + id));
    }
    
    // --- MÉTODO FALTANTE AÑADIDO ---
    public CitaResponseDto obtenerDtoPorId(Long id) {
        Cita cita = obtenerPorId(id); // Reutilizamos el método que ya teníamos
        return mapToCitaResponseDto(cita); // Convertimos la entidad a DTO
    }

    public Cita actualizarCita(Long id, CitaDto citaDto) {
        Cita citaExistente = obtenerPorId(id);
        
        Mascota mascota = mascotaRepository.findById(citaDto.getMascotaId())
                .orElseThrow(() -> new EntityNotFoundException("Mascota no encontrada con ID: " + citaDto.getMascotaId()));
        
        Usuario asignadoA = usuarioRepository.findById(citaDto.getAsignadoAId())
                .orElseThrow(() -> new EntityNotFoundException("Usuario (profesional) no encontrado con ID: " + citaDto.getAsignadoAId()));

        citaExistente.setFechaHora(citaDto.getFechaHora());
        citaExistente.setMotivo(citaDto.getMotivo());
        citaExistente.setEstado(citaDto.getEstado());
        citaExistente.setMascota(mascota);
        citaExistente.setAsignadoA(asignadoA);

        return citaRepository.save(citaExistente);
    }
    
    public Cita actualizarEstado(Long id, String estado) {
        Cita citaExistente = obtenerPorId(id);
        citaExistente.setEstado(estado);
        return citaRepository.save(citaExistente);
    }

    public void eliminarCita(Long id) {
        Cita cita = obtenerPorId(id);
        citaRepository.delete(cita);
    }

    @Transactional
    public Cita crearCita(CitaDto citaDto) {
        if ("AMBOS".equals(citaDto.getArea())) {
            Cita citaVeterinaria = crearCitaSimple(citaDto, "VETERINARIA", citaDto.getAsignadoAId(), citaDto.getFechaHora());
            
            LocalDateTime fechaGrooming = citaDto.getFechaHora().plusHours(1);
            Cita citaGrooming = crearCitaSimple(citaDto, "GROOMING", citaDto.getAsignadoAGroomingId(), fechaGrooming);
            
            citaVeterinaria.setCitaSiguienteId(citaGrooming.getId());
            citaRepository.save(citaVeterinaria);
            
            return citaVeterinaria;
        } else {
            return crearCitaSimple(citaDto, citaDto.getArea(), citaDto.getAsignadoAId(), citaDto.getFechaHora());
        }
    }

    private Cita crearCitaSimple(CitaDto dto, String area, Long asignadoAId, LocalDateTime fecha) {
        Mascota mascota = mascotaRepository.findById(dto.getMascotaId())
                .orElseThrow(() -> new EntityNotFoundException("Mascota no encontrada"));
        
        Usuario asignadoA = usuarioRepository.findById(asignadoAId)
                .orElseThrow(() -> new EntityNotFoundException("Profesional no encontrado"));
        
        Cita cita = new Cita();
        cita.setFechaHora(fecha);
        cita.setMotivo(dto.getMotivo());
        cita.setEstado("PROGRAMADA");
        cita.setArea(area);
        cita.setMascota(mascota);
        cita.setAsignadoA(asignadoA);
        
        return citaRepository.save(cita);
    }

    public List<CitaResponseDto> obtenerTodasComoDto() {
        return citaRepository.findAll().stream()
                .map(this::mapToCitaResponseDto)
                .collect(Collectors.toList());
    }
  
    public List<CitaResponseDto> findCitasDeHoyParaGroomerLogueado() {
        // Obtenemos el username del usuario logueado
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario groomer = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        LocalDate hoy = LocalDate.now();
        LocalDateTime inicioDelDia = hoy.atStartOfDay();
        LocalDateTime finDelDia = hoy.atTime(23, 59, 59);

        return citaRepository.findAll().stream()
                .filter(cita -> cita.getAsignadoA().getId().equals(groomer.getId()) &&
                                "GROOMING".equals(cita.getArea()) &&
                                !cita.getFechaHora().isBefore(inicioDelDia) &&
                                !cita.getFechaHora().isAfter(finDelDia))
                .map(this::mapToCitaResponseDto)
                .collect(Collectors.toList());
    }

    public List<CitaResponseDto> findHistorialGroomingParaMascota(Long mascotaId) {
        return citaRepository.findAll().stream()
                .filter(cita -> "GROOMING".equals(cita.getArea()) &&
                                cita.getMascota().getId().equals(mascotaId) &&
                                "COMPLETADA".equals(cita.getEstado()))
                .sorted(Comparator.comparing(Cita::getFechaHora).reversed()) // De más reciente a más antigua
                .map(this::mapToCitaResponseDto)
                .collect(Collectors.toList());
    }
    
    public Cita guardarNotasGrooming(Long citaId, String notas) {
        Cita cita = obtenerPorId(citaId);
        cita.setNotasGrooming(notas);
        return citaRepository.save(cita);
    }

        // --- MÉTODO NUEVO PARA EL HISTORIAL COMPLETO DE GROOMING ---
    public List<CitaResponseDto> findHistorialGroomingCompleto() {
        return citaRepository.findAll().stream()
                .filter(cita -> "GROOMING".equals(cita.getArea()) || "AMBOS".equals(cita.getArea()))
                .sorted(Comparator.comparing(Cita::getFechaHora).reversed())
                .map(this::mapToCitaResponseDto)
                .collect(Collectors.toList());
    }

        // --- MÉTODO NUEVO PARA LA AGENDA DEL VETERINARIO ---
    public List<CitaResponseDto> findCitasDeHoyParaVeterinarioLogueado() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario veterinario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("Usuario veterinario no encontrado"));

        LocalDate hoy = LocalDate.now();
        LocalDateTime inicioDelDia = hoy.atStartOfDay();
        LocalDateTime finDelDia = hoy.atTime(23, 59, 59);

        return citaRepository.findAll().stream()
                .filter(cita -> cita.getAsignadoA().getId().equals(veterinario.getId()) &&
                                (cita.getArea().equals("VETERINARIA") || cita.getArea().equals("AMBOS")) &&
                                !cita.getFechaHora().isBefore(inicioDelDia) &&
                                !cita.getFechaHora().isAfter(finDelDia))
                .sorted(Comparator.comparing(Cita::getFechaHora))
                .map(this::mapToCitaResponseDto)
                .collect(Collectors.toList());
    }

        /**
     * MÉTODO CORREGIDO: Ahora es público para poder ser usado por otros servicios.
     */
    public CitaResponseDto mapToCitaResponseDto(Cita cita) {
        CitaResponseDto dto = new CitaResponseDto();
        dto.setId(cita.getId());
        dto.setFechaHora(cita.getFechaHora());
        dto.setMotivo(cita.getMotivo());
        dto.setEstado(cita.getEstado());
        dto.setArea(cita.getArea());
        dto.setAsignadoA(cita.getAsignadoA());

        Mascota mascota = cita.getMascota();
        if (mascota != null) {
            MascotaConPropietarioDto mascotaDto = new MascotaConPropietarioDto();
            mascotaDto.setId(mascota.getId());
            mascotaDto.setNombre(mascota.getNombre());
            mascotaDto.setRaza(mascota.getRaza());
            mascotaDto.setSexo(mascota.getSexo());
            mascotaDto.setEsterilizado(mascota.isEsterilizado());
            mascotaDto.setFechaNacimiento(mascota.getFechaNacimiento());
            mascotaDto.setPeso(mascota.getPeso());
            
            Propietario propietario = mascota.getPropietario();
            if (propietario != null) {
                PropietarioSimpleDto propDto = new PropietarioSimpleDto();
                propDto.setId(propietario.getId());
                propDto.setNombre(propietario.getNombre());
                propDto.setApellido(propietario.getApellido());
                propDto.setDni(propietario.getDni());
                propDto.setTelefono(propietario.getTelefono());
                propDto.setEmail(propietario.getEmail());
                mascotaDto.setPropietario(propDto);
            }
            dto.setMascota(mascotaDto);
        }
        return dto;
    }
}

