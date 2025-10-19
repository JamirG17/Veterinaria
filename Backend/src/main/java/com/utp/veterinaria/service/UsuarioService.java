package com.utp.veterinaria.service;

import com.utp.veterinaria.dto.RegistroDto;
import com.utp.veterinaria.model.Rol;
import com.utp.veterinaria.model.Usuario;
import com.utp.veterinaria.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Usuario registrarUsuario(RegistroDto registroDto) {
        if (usuarioRepository.existsByUsername(registroDto.getUsername())) {
            throw new RuntimeException("El nombre de usuario ya existe.");
        }

        Usuario usuario = new Usuario();
        usuario.setUsername(registroDto.getUsername());
        usuario.setPassword(passwordEncoder.encode(registroDto.getPassword()));

        Set<Rol> roles = new HashSet<>();
        registroDto.getRoles().forEach(rol -> {
            switch (rol) {
                case "admin":
                    roles.add(Rol.ROL_ADMINISTRADOR);
                    break;
                case "veterinario":
                    roles.add(Rol.ROL_VETERINARIO);
                    break;
                case "recepcionista":
                    roles.add(Rol.ROL_RECEPCIONISTA);
                    break;
                case "grooming":
                    roles.add(Rol.ROL_GROOMING);
                    break;
            }
        });
        usuario.setRoles(roles);

        return usuarioRepository.save(usuario);
    }

    /**
     * MÉTODO NUEVO: Encuentra todos los usuarios que contienen un rol específico.
     * @param roleName El nombre del rol a buscar (ej: "ROL_VETERINARIO").
     * @return Una lista de usuarios con ese rol.
     */
    public List<Usuario> findByRole(String roleName) {
        Rol rol = Rol.valueOf(roleName); // Convierte el string al tipo Enum
        return usuarioRepository.findAll().stream()
                .filter(usuario -> usuario.getRoles().contains(rol))
                .collect(Collectors.toList());
    }
}
