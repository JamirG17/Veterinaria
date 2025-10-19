import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Propietario } from '../models/api-models';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PropietarioService {
  private apiUrl = `${environment.apiUrl}/propietarios`;

  constructor(private http: HttpClient) { }

  getPropietarios(): Observable<Propietario[]> {
    return this.http.get<Propietario[]>(this.apiUrl);
  }

  // --- MÉTODO AÑADIDO ---
  // Obtiene un solo propietario por su ID.
  getPropietarioPorId(id: number): Observable<Propietario> {
    return this.http.get<Propietario>(`${this.apiUrl}/${id}`);
  }

  createPropietario(propietarioData: any): Observable<Propietario> {
    return this.http.post<Propietario>(this.apiUrl, propietarioData);
  }

  updatePropietario(id: number, propietarioData: any): Observable<Propietario> {
    return this.http.put<Propietario>(`${this.apiUrl}/${id}`, propietarioData);
  }
}

