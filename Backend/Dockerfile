# 1. Etapa de Construcción (Build Stage)
FROM maven:3.9.5-eclipse-temurin-17 AS build
# Copia todo el código fuente del backend al contenedor
COPY . /app
WORKDIR /app
# Compila el proyecto y crea el JAR ejecutable
RUN mvn clean install -DskipTests

# 2. Etapa de Ejecución (Runtime Stage)
# Usamos una imagen base más ligera (solo Java Runtime Environment)
FROM eclipse-temurin:17-jre-focal
# Define la ubicación del JAR final (el que se copió de la etapa 'build')
# CORRECCIÓN: Usamos el nombre de tu artefacto: 'veterinaria-0.0.1.jar'
ARG JAR_FILE=/app/target/veterinaria-0.0.1.jar 
COPY --from=build ${JAR_FILE} app.jar
# Define la zona horaria (opcional, pero buena práctica)
ENV TZ=America/Lima
# Define el comando de inicio
ENTRYPOINT ["java", "-jar", "/app.jar"]
