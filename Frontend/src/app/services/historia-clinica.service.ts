import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistoriaClinica } from '../models/api-models';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HistoriaClinicaService {
  private apiUrl = `${environment.apiUrl}/historias-clinicas`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todo el historial clínico completo.
   */
  getHistorialCompleto(): Observable<HistoriaClinica[]> {
    return this.http.get<HistoriaClinica[]>(this.apiUrl);
  }

  getHistorialPorMascota(mascotaId: number): Observable<HistoriaClinica[]> {
    return this.http.get<HistoriaClinica[]>(`${this.apiUrl}/mascota/${mascotaId}`);
  }

  createRegistro(registroData: any): Observable<HistoriaClinica> {
    return this.http.post<HistoriaClinica>(this.apiUrl, registroData);
  }
}

