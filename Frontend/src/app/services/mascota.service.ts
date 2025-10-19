import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mascota } from '../models/api-models';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MascotaService {
  private apiUrl = `${environment.apiUrl}/api/mascotas`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene una lista de todas las mascotas.
   * @returns Un Observable con un array de Mascotas.
   */
  getMascotas(): Observable<Mascota[]> {
    return this.http.get<Mascota[]>(this.apiUrl);
  }

  /**
   * Obtiene una mascota específica por su ID.
   * @param id El ID de la mascota a buscar.
   * @returns Un Observable con los datos de la Mascota.
   */
  getMascotaPorId(id: number): Observable<Mascota> {
    return this.http.get<Mascota>(`${this.apiUrl}/${id}`);
  }

  /**
   * Registra una nueva mascota en el sistema.
   * @param mascotaData Los datos de la nueva mascota.
   * @returns Un Observable con la Mascota recién creada.
   */
  createMascota(mascotaData: any): Observable<Mascota> {
    return this.http.post<Mascota>(this.apiUrl, mascotaData);
  }

  /**
   * Actualiza los datos de una mascota existente.
   * @param id El ID de la mascota a actualizar.
   * @param mascotaData Los nuevos datos para la mascota.
   * @returns Un Observable con la Mascota actualizada.
   */
  updateMascota(id: number, mascotaData: any): Observable<Mascota> {
    return this.http.put<Mascota>(`${this.apiUrl}/${id}`, mascotaData);
  }

  /**
   * Elimina una mascota del sistema.
   * @param id El ID de la mascota a eliminar.
   * @returns Un Observable vacío que se completa al finalizar.
   */
  deleteMascota(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

    /**
   * MÉTODO AÑADIDO: Actualiza únicamente el campo de alergias de una mascota.
   * @param id El ID de la mascota.
   * @param alergias El texto con las nuevas alergias.
   * @returns Un Observable con la Mascota actualizada.
   */
  updateAlergias(id: number, alergias: string): Observable<Mascota> {
    const payload = { alergias: alergias };
    return this.http.patch<Mascota>(`${this.apiUrl}/${id}/alergias`, payload);
  }
}

