import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PacienteDetalle } from '../models/api-models';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private apiUrl = `${environment.apiUrl}/pacientes`;

  constructor(private http: HttpClient) { }

  getDetalleCompleto(mascotaId: number): Observable<PacienteDetalle> {
    return this.http.get<PacienteDetalle>(`${this.apiUrl}/${mascotaId}/detalle`);
  }
}
