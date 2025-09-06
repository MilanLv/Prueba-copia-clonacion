import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Rol, RolCreate, RolUpdate } from '../models/rol.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private readonly API_URL = `${environment.apiUrl}/roles`;

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

  // Obtener todos los roles
  getAll(): Observable<any> {
    console.log('🔍 RolesService - getAll iniciado');
    console.log('🔍 RolesService - URL:', `${this.API_URL}`);
    console.log('🔍 RolesService - Headers:', this.getHeaders());
    
    return this.http.get(`${this.API_URL}`, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('❌ RolesService - Error en getAll:', error);
          return this.handleError(error);
        })
      );
  }

  // Obtener roles activos
  getActive(): Observable<any> {
    return this.http.get(`${this.API_URL}/active`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Obtener rol por ID
  getById(id: number): Observable<any> {
    return this.http.get(`${this.API_URL}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Crear rol
  create(rol: RolCreate): Observable<any> {
    return this.http.post(`${this.API_URL}`, rol, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Actualizar rol
  update(id: number, rol: RolUpdate): Observable<any> {
    return this.http.put(`${this.API_URL}/${id}`, rol, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Activar/Desactivar rol
  toggleActive(id: number): Observable<any> {
    return this.http.put(`${this.API_URL}/${id}/toggle`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Eliminar rol
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('Roles Service Error:', error);
    return throwError(() => error);
  }
}
