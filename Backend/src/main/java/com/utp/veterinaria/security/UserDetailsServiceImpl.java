package com.utp.veterinaria.security;

import com.utp.veterinaria.model.Usuario;
import com.utp.veterinaria.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.stream.Collectors;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        
        // [DEPURACIÓN] Indica que se está buscando el usuario
        System.out.println("[DEPURACIÓN] Buscando usuario en la BD: " + username);

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> {
                    // [DEPURACIÓN] Si el usuario no se encuentra, registramos el fallo
                    System.err.println("[ERROR AUTENTICACIÓN] Usuario no encontrado: " + username);
                    return new UsernameNotFoundException("El usuario " + username + " no existe.");
                });
        
        // [DEPURACIÓN] Indica que el usuario fue encontrado
        System.out.println("[DEPURACIÓN] Usuario encontrado. Verificando roles para: " + username);

        Collection<? extends GrantedAuthority> authorities = usuario.getRoles().stream()
                .map(rol -> new SimpleGrantedAuthority(rol.name()))
                .collect(Collectors.toList());
        
        // [DEPURACIÓN] Muestra los roles cargados
        System.out.println("[DEPURACIÓN] Roles cargados: " + authorities);

        // Devuelve el objeto UserDetails (Spring se encargará de verificar la contraseña encriptada)
        return new User(usuario.getUsername(), usuario.getPassword(), authorities);
    }
}
