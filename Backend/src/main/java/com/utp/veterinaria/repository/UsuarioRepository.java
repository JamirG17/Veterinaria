package com.utp.veterinaria.repository;

import com.utp.veterinaria.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Método para buscar un usuario por su nombre de usuario
    Optional<Usuario> findByUsername(String username);

    // Método para verificar si un usuario ya existe
    Boolean existsByUsername(String username);
}