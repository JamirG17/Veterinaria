import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/api-models';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista de usuarios con el rol de Veterinario desde el backend.
   * @returns Un Observable con un array de Usuarios.
   */
  getVeterinarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/veterinarios`);
  }

  /**
   * Obtiene la lista de usuarios con el rol de Grooming desde el backend.
   * @returns Un Observable con un array de Usuarios.
   */
  getGroomers(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/groomers`);
  }
}

