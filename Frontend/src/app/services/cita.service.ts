import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cita } from '../models/api-models';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private apiUrl = `${environment.apiUrl}/citas`;

  constructor(private http: HttpClient) { }

  getCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(this.apiUrl);
  }

  createCita(citaData: any): Observable<Cita> {
    return this.http.post<Cita>(this.apiUrl, citaData);
  }
  
  /**
   * Actualiza una cita existente.
   */
  updateCita(id: number, citaData: any): Observable<Cita> {
    return this.http.put<Cita>(`${this.apiUrl}/${id}`, citaData);
  }

  /**
   * Actualiza solo el estado de una cita.
   */
  updateEstadoCita(id: number, estado: string): Observable<Cita> {
    return this.http.patch<Cita>(`${this.apiUrl}/${id}/estado`, { estado });
  }

  /**
   * Elimina (cancela) una cita.
   */
  deleteCita(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getCitaPorId(id: number): Observable<Cita> {
    return this.http.get<Cita>(`${this.apiUrl}/${id}`);
  }

  
  getAgendaGroomerHoy(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/groomer/agenda`);
  }

  getHistorialGrooming(mascotaId: number): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/mascota/${mascotaId}/historial-grooming`);
  }

  guardarNotasGrooming(citaId: number, notas: string): Observable<Cita> {
    return this.http.patch<Cita>(`${this.apiUrl}/${citaId}/notas-grooming`, { notas });
  }

    // --- NUEVO MÉTODO PARA EL HISTORIAL DE GROOMING ---
  getHistorialGroomingCompleto(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/historial/grooming`);
  }

    // --- NUEVO MÉTODO PARA LA AGENDA DEL VETERINARIO ---
  getAgendaVeterinarioHoy(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/veterinario/agenda`);
  }
}

