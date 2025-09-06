import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  Usuario, 
  UsuarioCreate, 
  UsuarioUpdate, 
  UsuarioPasswordChange, 
  UsuarioStats, 
  UsuarioTopActive 
} from '../models/usuario.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private readonly API_URL = `${environment.apiUrl}/usuarios`;

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

  // Obtener todos los usuarios
  getAll(): Observable<any> {
    return this.http.get(`${this.API_URL}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Obtener usuarios activos
  getActive(): Observable<any> {
    return this.http.get(`${this.API_URL}/active`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Obtener usuario por ID
  getById(id: number): Observable<any> {
    return this.http.get(`${this.API_URL}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Obtener usuarios por rol
  getByRol(rolId: number): Observable<any> {
    return this.http.get(`${this.API_URL}/rol/${rolId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Obtener estadísticas
  getStats(): Observable<any> {
    return this.http.get(`${this.API_URL}/stats`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Obtener usuarios más activos
  getTopActive(): Observable<any> {
    return this.http.get(`${this.API_URL}/top-active`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Crear usuario
  create(usuario: UsuarioCreate): Observable<any> {
    return this.http.post(`${this.API_URL}`, usuario, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Actualizar usuario
  update(id: number, usuario: UsuarioUpdate): Observable<any> {
    return this.http.put(`${this.API_URL}/${id}`, usuario, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Cambiar contraseña
  updatePassword(id: number, passwordData: UsuarioPasswordChange): Observable<any> {
    return this.http.put(`${this.API_URL}/${id}/password`, passwordData, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Activar/Desactivar usuario
  toggleActive(id: number): Observable<any> {
    return this.http.put(`${this.API_URL}/${id}/toggle`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Eliminar usuario
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('Usuarios Service Error:', error);
    return throwError(() => error);
  }
}
