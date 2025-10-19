package com.utp.veterinaria.controller;

import com.utp.veterinaria.dto.JwtDto;
import com.utp.veterinaria.dto.LoginDto;
import com.utp.veterinaria.dto.RegistroDto;
import com.utp.veterinaria.security.JwtProvider;
import com.utp.veterinaria.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtProvider jwtProvider;
    
    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(@RequestBody RegistroDto registroDto) {
        try {
            // [DEPURACIÓN]
            System.out.println("[DEPURACIÓN] Solicitud /registro recibida para usuario: " + registroDto.getUsername());
            
            usuarioService.registrarUsuario(registroDto);
            return new ResponseEntity<>("Usuario registrado exitosamente", HttpStatus.CREATED);
        } catch (RuntimeException e) {

            System.err.println("[ERROR EN REGISTRO] " + e.getMessage());
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto loginDto) {
        try {
            System.out.println("[DEPURACIÓN] Solicitud /login recibida para usuario: " + loginDto.getUsername());

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginDto.getUsername(), loginDto.getPassword())
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String token = jwtProvider.generateToken(authentication);
            
            // Si tiene éxito, devuelve 200 OK con el JWT
            return new ResponseEntity<>(new JwtDto(token), HttpStatus.OK);

        } catch (org.springframework.security.core.AuthenticationException e) {
            // ** CAPTURAMOS LA EXCEPCIÓN DE AUTENTICACIÓN (Usuario/Contraseña incorrecta) **
            // Este log aparecerá en el journalctl/error.log
            System.err.println("[FALLO AUTENTICACIÓN] Usuario: " + loginDto.getUsername() + " - Mensaje: " + e.getMessage()); 
            
            // Devolvemos 401 Unauthorized para que el frontend lo maneje
            return new ResponseEntity<>("Credenciales de acceso inválidas", HttpStatus.UNAUTHORIZED); 
        
        } catch (Exception e) {
             // Captura cualquier otro error inesperado (ej. problemas de Base de Datos)
             System.err.println("[ERROR INESPERADO] Falla al procesar login: " + e.getMessage());
             return new ResponseEntity<>("Error interno del servidor", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
