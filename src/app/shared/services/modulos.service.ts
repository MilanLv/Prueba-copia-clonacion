import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Modulo,
  ModuloCreate,
  ModuloUpdate,
  ModuloResponse,
  ModulosResponse,
  ModuloRolesResponse
} from '../models/modulo.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ModulosService {
  private readonly API_URL = `${environment.apiUrl}/modulos`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Obtener todos los módulos
  getAll(): Observable<ModulosResponse> {
    console.log('🔍 ModulosService - getAll iniciado');
    console.log('🔍 ModulosService - URL:', this.API_URL);
    console.log('🔍 ModulosService - Headers:', this.getHeaders());
    
    return this.http.get<ModulosResponse>(this.API_URL, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('❌ ModulosService - Error en getAll:', error);
          return this.handleError(error);
        })
      );
  }

  // Obtener módulos activos
  getActive(): Observable<ModulosResponse> {
    return this.http.get<ModulosResponse>(`${this.API_URL}/active`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Obtener módulo por ID
  getById(id: number): Observable<ModuloResponse> {
    return this.http.get<ModuloResponse>(`${this.API_URL}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Obtener roles de un módulo
  getRolesByModule(id: number): Observable<ModuloRolesResponse> {
    return this.http.get<ModuloRolesResponse>(`${this.API_URL}/${id}/roles`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Crear módulo
  create(modulo: ModuloCreate): Observable<ModuloResponse> {
    return this.http.post<ModuloResponse>(this.API_URL, modulo, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Actualizar módulo
  update(id: number, modulo: ModuloUpdate): Observable<ModuloResponse> {
    return this.http.put<ModuloResponse>(`${this.API_URL}/${id}`, modulo, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Eliminar módulo
  delete(id: number): Observable<ModuloResponse> {
    return this.http.delete<ModuloResponse>(`${this.API_URL}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Activar/desactivar módulo
  toggleActive(id: number): Observable<ModuloResponse> {
    return this.http.put<ModuloResponse>(`${this.API_URL}/${id}/toggle`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('Modulos Service Error:', error);
    return throwError(() => error);
  }
}
