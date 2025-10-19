import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  login(credentials: any): Observable<any> {
    const loginUrl = `${this.apiUrl}/auth/login`;
    return this.http.post(loginUrl, credentials);
  }

  registrar(usuario: any): Observable<any> {
    const registroUrl = `${this.apiUrl}/auth/registro`;
    return this.http.post(registroUrl, usuario);
  }
  
  // ===============================================
  // MÉTODO DE SEGURIDAD PARA EL TOKEN (CRÍTICO)
  // ===============================================
  getValidToken(): string | null {
    const token = localStorage.getItem('jwt_token');
    if (token && token.split('.').length === 3) {
      return token;
    }
    return null;
  }


}
