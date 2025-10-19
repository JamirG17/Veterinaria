import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Raza {
  id: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class RazaService {
  private apiUrl = `${environment.apiUrl}/razas`;

  constructor(private http: HttpClient) { }

  getRazas(): Observable<Raza[]> {
    return this.http.get<Raza[]>(this.apiUrl);
  }

  createRaza(razaData: { nombre: string }): Observable<Raza> {
    return this.http.post<Raza>(this.apiUrl, razaData);
  }
}
