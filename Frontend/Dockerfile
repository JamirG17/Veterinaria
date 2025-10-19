# 1. Etapa de Construcción (Build Stage)
FROM node:20 AS build
# Configuración
WORKDIR /app
COPY package.json package-lock.json ./
# Instala dependencias
RUN npm install
# Copia el resto del código
COPY . .
# Compila Angular para producción
# Usamos 'ng build' directamente sin la ruta de salida, confiando en el angular.json
RUN npm run build 

# 2. Etapa de Ejecución (Runtime Stage) - Servir con Nginx
FROM nginx:alpine
# CORRECCIÓN: La CLI moderna de Angular anida el build en subcarpetas.
# Esto asume que el nombre de tu proyecto es 'veterinaria-frontend'
# o que la salida es directa a 'dist/browser'. Si falla, cambia 'browser' 
# por el nombre de tu proyecto real.
COPY --from=build /app/dist/veterinaria-frontend/browser /usr/share/nginx/html 
# Nota: Si el comando 'npm run build' en tu proyecto pone todo directamente en /dist,
# la ruta correcta podría ser simplemente /app/dist/ o /app/dist/browser.
# Si el despliegue falla, prueba con /app/dist/
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
# Nginx se inicia automáticamente
EXPOSE 80
