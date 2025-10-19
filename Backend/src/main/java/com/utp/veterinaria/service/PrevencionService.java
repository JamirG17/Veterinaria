package com.utp.veterinaria.service;

import com.utp.veterinaria.model.Mascota;
import com.utp.veterinaria.model.Prevencion;
import com.utp.veterinaria.repository.MascotaRepository;
import com.utp.veterinaria.repository.PrevencionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PrevencionService {

    @Autowired
    private PrevencionRepository prevencionRepository;

    @Autowired
    private MascotaRepository mascotaRepository;

    public Prevencion addPrevencion(Long mascotaId, Prevencion prevencion) {
        Mascota mascota = mascotaRepository.findById(mascotaId)
                .orElseThrow(() -> new EntityNotFoundException("Mascota no encontrada"));
        prevencion.setMascota(mascota);
        return prevencionRepository.save(prevencion);
    }

    public void deletePrevencion(Long prevencionId) {
        prevencionRepository.deleteById(prevencionId);
    }
}
