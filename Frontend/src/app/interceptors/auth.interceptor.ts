import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Obtenemos el token del localStorage
  const token = localStorage.getItem('jwt_token');

  // Si el token existe, clonamos la petición y le añadimos la cabecera
  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    // Pasamos la petición clonada con la cabecera al siguiente manejador
    return next(cloned);
  }

  // Si no hay token, simplemente dejamos pasar la petición original
  return next(req);
};