// Este archivo de entorno se usa en producción, donde Nginx actúa como proxy en el puerto 80.

export const environment = {
  production: true,
  // CORRECCIÓN CLAVE: Usar el path '/api' obliga a Angular a llamar al Nginx proxy
  // en el puerto 80, y Nginx reenvía internamente al backend:8080.
  apiUrl: '/api' 
};
