package com.utp.veterinaria.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtProvider jwtProvider;
    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String token = getTokenFromRequest(request);
        
        // --- LOG DE DEPURACIÓN ---
        System.out.println("--- INICIANDO JWT FILTER PARA LA RUTA: " + request.getRequestURI() + " ---");

        if (token != null && jwtProvider.validateToken(token)) {
            String username = jwtProvider.getUsernameFromToken(token);
            
            // --- LOG DE DEPURACIÓN ---
            System.out.println("Token válido. Username extraído: " + username);

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // --- ¡EL LOG MÁS IMPORTANTE! ---
            // Imprimimos los permisos que se cargaron desde la base de datos.
            System.out.println("PERMISOS CARGADOS PARA EL USUARIO: " + userDetails.getAuthorities());

            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());

            authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            
            // --- LOG DE DEPURACIÓN ---
            System.out.println("Usuario autenticado y establecido en el contexto de seguridad.");

        } else {
            // --- LOG DE DEPURACIÓN ---
            System.out.println("No se encontró un token válido en la cabecera.");
        }
        
        filterChain.doFilter(request, response);
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}

