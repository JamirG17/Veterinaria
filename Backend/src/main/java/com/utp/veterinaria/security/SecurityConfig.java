package com.utp.veterinaria.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import io.micrometer.common.lang.NonNull;


import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }

    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    // --- ELIMINAMOS EL BEAN CorsConfigurationSource ---
    // --- USAMOS EL MÉTODO WebMvcConfigurer COMO LO TENÍAS ANTES ---
    
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(@NonNull CorsRegistry registry) {
                // Usamos la IP de tu VM (puerto 80 por Nginx) y localhost
                registry.addMapping("/**")
                        .allowedOrigins("http://129.148.37.166", "http://localhost:4200")
                        .allowedMethods("*") // Incluye GET, POST, OPTIONS, etc.
                        .allowedHeaders("*") // Incluye Authorization, Content-Type, etc.
                        .allowCredentials(true); // Permitimos credenciales
            }
        };
    }
    // NOTA: El .cors(Customizer.withDefaults()) en filterChain usará esta configuración automáticamente.


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults()) // Utilizará el bean corsConfigurer() arriba
            .csrf(csrf -> csrf.disable()) // Correcto: Deshabilitado para APIs JWT
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Correcto
                .requestMatchers("/auth/**").permitAll() // Correcto: Permite acceso SIN AUTENTICACIÓN
                .requestMatchers(HttpMethod.GET, "/api/pacientes/**").hasAnyAuthority("ROL_ADMINISTRADOR", "ROL_RECEPCIONISTA", "ROL_VETERINARIO")
                .requestMatchers("/api/prevenciones/**").hasAnyAuthority("ROL_ADMINISTRADOR", "ROL_VETERINARIO")
                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
