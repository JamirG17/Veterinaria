package com.utp.veterinaria.service;

import com.utp.veterinaria.dto.AnalisisResponseDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory; // <-- IMPORTAMOS PARA TIMEOUTS
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class IAService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate; // <-- CAMBIADO A FINAL
    private final ObjectMapper objectMapper = new ObjectMapper();

    // --- CONSTRUCTOR AÑADIDO PARA LOS TIMEOUTS ---
    public IAService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(30000); // 30 segundos de timeout de conexión
        factory.setReadTimeout(30000);    // 30 segundos de timeout de lectura
        this.restTemplate = new RestTemplate(factory);
    }

    /**
     * Función de ayuda para escapar caracteres especiales de JSON en un string.
     */
    private String escapeJson(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\")
                   .replace("\"", "\\\"")
                   .replace("\n", "\\n")
                   .replace("\r", "\\r")
                   .replace("\t", "\\t");
    }

    public AnalisisResponseDto analizarTexto(String textoCrudo) {
        
        String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=" + apiKey;

        // --- ¡PROMPT MEJORADO! ---
        // Usamos delimitadores (---) para que la IA sepa qué es una instrucción
        // y qué es el texto que debe analizar.
        String prompt = "Eres un asistente veterinario experto. Tu tarea es analizar el texto dictado y estructurarlo en formato JSON S.O.A.P. con CUATRO claves: 'titulo', 'sintomas', 'diagnostico' y 'tratamiento'.\n" +
                        "--- INSTRUCCIONES ---\n" +
                        "1. 'titulo': Un título muy corto y descriptivo (ej: 'Consulta por cojera', 'Vacunación').\n" +
                        "2. 'sintomas': Observaciones objetivas y lo reportado por el propietario.\n" +
                        "3. 'diagnostico': El análisis o conclusión del doctor.\n" +
                        "4. 'tratamiento': El plan o medicinas.\n" +
                        "5. NO repitas el texto de entrada. Solo genera el JSON.\n" +
                        "--- DICTADO A ANALIZAR ---\n" +
                        textoCrudo;

        String escapedPrompt = escapeJson(prompt);

        // Usamos la estructura simple de "contents" que SÍ te funcionó
        String requestBody = String.format(
            "{\"contents\":[{\"parts\":[{\"text\": \"%s\"}]}], \"generationConfig\": {\"responseMimeType\": \"application/json\", \"responseSchema\": {\"type\": \"OBJECT\", \"properties\": {\"titulo\": {\"type\": \"STRING\"}, \"sintomas\": {\"type\": \"STRING\"}, \"diagnostico\": {\"type\": \"STRING\"}, \"tratamiento\": {\"type\": \"STRING\"}}}}}",
            escapedPrompt
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        try {
            System.out.println("\n[IAService] (Modo Real) Enviando petición a Gemini API...");
            String response = restTemplate.postForObject(apiUrl, entity, String.class);
            System.out.println("[IAService] Respuesta recibida de Gemini.");
            
            JsonNode root = objectMapper.readTree(response);
            String jsonText = root.at("/candidates/0/content/parts/0/text").asText();
            
            return objectMapper.readValue(jsonText, AnalisisResponseDto.class);
            
        } catch (Exception e) {
            System.err.println("[IAService] ERROR al llamar a Gemini API: " + e.getMessage());
            e.printStackTrace();
            AnalisisResponseDto errorDto = new AnalisisResponseDto();
            errorDto.setSintomas("Error de conexión con la IA: " + e.getMessage() + ". Texto crudo: " + textoCrudo);
            errorDto.setDiagnostico("Asegúrate de que la API Key es correcta y de que tu firewall no está bloqueando la conexión a Google.");
            errorDto.setTratamiento("");
            return errorDto;
        }
    }
}