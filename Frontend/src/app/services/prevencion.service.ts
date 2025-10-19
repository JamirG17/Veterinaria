import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Prevencion } from '../models/api-models';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PrevencionService {
  private apiUrl = `${environment.apiUrl}/api/prevenciones`;

  constructor(private http: HttpClient) { }

  addPrevencion(mascotaId: number, prevencionData: any): Observable<Prevencion> {
    return this.http.post<Prevencion>(`${this.apiUrl}/mascota/${mascotaId}`, prevencionData);
  }

  deletePrevencion(prevencionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${prevencionId}`);
  }
}
