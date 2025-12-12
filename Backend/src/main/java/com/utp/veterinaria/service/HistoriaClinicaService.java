package com.utp.veterinaria.service;

import com.utp.veterinaria.dto.HistoriaClinicaDto;
import com.utp.veterinaria.dto.HistoriaClinicaResponseDto;
import com.utp.veterinaria.dto.MascotaConPropietarioDto;
import com.utp.veterinaria.model.*;
import com.utp.veterinaria.repository.HistoriaClinicaRepository;
import com.utp.veterinaria.repository.MascotaRepository;
import com.utp.veterinaria.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HistoriaClinicaService {

    @Autowired
    private HistoriaClinicaRepository historiaClinicaRepository;
    @Autowired
    private MascotaRepository mascotaRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private MascotaService mascotaService;

    public List<HistoriaClinica> obtenerHistoriasPorMascotaId(Long mascotaId) {
        if (!mascotaRepository.existsById(mascotaId)) {
            throw new EntityNotFoundException("Mascota no encontrada con ID: " + mascotaId);
        }
        // Se podría añadir paginación y ordenamiento aquí en un futuro
        return historiaClinicaRepository.findAll().stream()
                .filter(h -> h.getMascota().getId().equals(mascotaId))
                .toList();
    }

    public HistoriaClinica obtenerPorId(Long id) {
        return historiaClinicaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Registro de historia clínica no encontrado con ID: " + id));
    }

    public HistoriaClinica crearHistoriaClinica(HistoriaClinicaDto historiaDto) {
        Mascota mascota = mascotaRepository.findById(historiaDto.getMascotaId())
                .orElseThrow(() -> new EntityNotFoundException("Mascota no encontrada con ID: " + historiaDto.getMascotaId()));
        
        Usuario veterinario = usuarioRepository.findById(historiaDto.getVeterinarioId())
                .orElseThrow(() -> new EntityNotFoundException("Usuario (veterinario) no encontrado con ID: " + historiaDto.getVeterinarioId()));

        // Regla de negocio: Solo los veterinarios pueden crear historias clínicas
        if (!veterinario.getRoles().contains(Rol.ROL_VETERINARIO)) {
            throw new AccessDeniedException("Solo los usuarios con rol VETERINARIO pueden crear historias clínicas.");
        }
        
        HistoriaClinica historia = new HistoriaClinica();
        historia.setFecha(LocalDateTime.now());
        historia.setTitulo(historiaDto.getTitulo()); 
        historia.setSintomas(historiaDto.getSintomas());
        historia.setDiagnostico(historiaDto.getDiagnostico());
        historia.setTratamiento(historiaDto.getTratamiento());
        historia.setMascota(mascota);
        historia.setVeterinario(veterinario);
        
        return historiaClinicaRepository.save(historia);
    }
    
    // NOTA: La actualización y eliminación de historias clínicas suele ser restringida.
    // A menudo no se permite para mantener la integridad de los datos médicos.
    // Se incluyen aquí como ejemplo.
    
    public HistoriaClinica actualizarHistoriaClinica(Long id, HistoriaClinicaDto historiaDto) {
        HistoriaClinica historiaExistente = obtenerPorId(id);
        
        // Aquí podrías añadir lógica para verificar permisos antes de actualizar
        
        historiaExistente.setSintomas(historiaDto.getSintomas());
        historiaExistente.setDiagnostico(historiaDto.getDiagnostico());
        historiaExistente.setTratamiento(historiaDto.getTratamiento());
        
        return historiaClinicaRepository.save(historiaExistente);
    }

    public void eliminarHistoriaClinica(Long id) {
        HistoriaClinica historia = obtenerPorId(id);
        historiaClinicaRepository.delete(historia);
    }

        // --- MÉTODO NUEVO PARA OBTENER TODO EL HISTORIAL ---
    public List<HistoriaClinica> obtenerTodos() {
        // Ordenamos de más reciente a más antiguo
        return historiaClinicaRepository.findAll().stream()
                .sorted(Comparator.comparing(HistoriaClinica::getFecha).reversed())
                .collect(Collectors.toList());
    }

        // --- MÉTODO ACTUALIZADO PARA DEVOLVER DTOs ---
    public List<HistoriaClinicaResponseDto> obtenerTodosComoDto() {
        return historiaClinicaRepository.findAll().stream()
                .sorted(Comparator.comparing(HistoriaClinica::getFecha).reversed())
                .map(this::mapToHistoriaClinicaResponseDto)
                .collect(Collectors.toList());
    }

    // --- LÓGICA DE MAPEO ---
    private HistoriaClinicaResponseDto mapToHistoriaClinicaResponseDto(HistoriaClinica historia) {
        HistoriaClinicaResponseDto dto = new HistoriaClinicaResponseDto();
        dto.setId(historia.getId());
        dto.setFecha(historia.getFecha());
        dto.setSintomas(historia.getSintomas());
        dto.setDiagnostico(historia.getDiagnostico());
        dto.setTratamiento(historia.getTratamiento());
        dto.setVeterinario(historia.getVeterinario());
        
        if (historia.getMascota() != null) {
            // Reutilizamos el mapeo de MascotaService para asegurar la consistencia
            MascotaConPropietarioDto mascotaDto = mascotaService.mapToMascotaConPropietarioDto(historia.getMascota());
            dto.setMascota(mascotaDto);
        }
        
        return dto;
    }
}