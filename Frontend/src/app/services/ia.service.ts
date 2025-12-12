import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AnalisisResponse } from '../models/api-models';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IaService {
  private apiUrl = `${environment.apiUrl}/ia`;

  constructor(private http: HttpClient) { }

  /**
   * Envía el texto crudo al backend para ser analizado por la IA.
   * @param texto El texto completo dictado por el veterinario.
   * @returns Un Observable con la respuesta JSON estructurada.
   */
  analizarTexto(texto: string): Observable<AnalisisResponse> {
    const request = { texto: texto };
    return this.http.post<AnalisisResponse>(`${this.apiUrl}/analizar-texto`, request);
  }
}