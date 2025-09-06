import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  Permiso, 
  PermisoCreate, 
  PermisoUpdate, 
  PermisoResponse, 
  PermisoMatrix, 
  PermisoBatch,
  PermisoCanDo 
} from '../models/permiso.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermisosService {
  private readonly API_URL = `${environment.apiUrl}/permisos`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Obtener todos los permisos
  getAll(): Observable<Permiso[]> {
    console.log('🔍 PermisosService - getAll iniciado');
    console.log('🔍 PermisosService - URL:', this.API_URL);
    console.log('🔍 PermisosService - Headers:', this.getHeaders());
    
    return this.http.get<PermisoResponse>(this.API_URL, { headers: this.getHeaders() }).pipe(
      map(response => {
        console.log('✅ PermisosService - Response recibido:', response);
        console.log('📊 PermisosService - Response success:', response.success);
        console.log('📊 PermisosService - Response data:', response.data);
        console.log('📊 PermisosService - Data es array:', Array.isArray(response.data));
        
        if (response.success && Array.isArray(response.data)) {
          console.log('✅ PermisosService - Retornando data:', response.data);
          return response.data;
        }
        console.error('❌ PermisosService - Error en response:', response.message);
        throw new Error(response.message || 'Error al obtener permisos');
      }),
      catchError(error => {
        console.error('❌ PermisosService - Error en getAll:', error);
        return this.handleError(error);
      })
    );
  }

  // Obtener matriz de permisos
  getMatrix(): Observable<PermisoMatrix[]> {
    return this.http.get<PermisoResponse>(`${this.API_URL}/matrix`, { headers: this.getHeaders() }).pipe(
      map(response => {
        if (response.success && Array.isArray(response.data)) {
          return response.data as unknown as PermisoMatrix[];
        }
        throw new Error(response.message || 'Error al obtener matriz de permisos');
      }),
      catchError(this.handleError)
    );
  }

  // Obtener permiso por ID
  getById(id: number): Observable<Permiso> {
    return this.http.get<PermisoResponse>(`${this.API_URL}/${id}`, { headers: this.getHeaders() }).pipe(
      map(response => {
        if (response.success && response.data && !Array.isArray(response.data)) {
          return response.data;
        }
        throw new Error(response.message || 'Error al obtener permiso por ID');
      }),
      catchError(this.handleError)
    );
  }

  // Obtener permisos por rol
  getByRol(rolId: number): Observable<Permiso[]> {
    return this.http.get<PermisoResponse>(`${this.API_URL}/rol/${rolId}`, { headers: this.getHeaders() }).pipe(
      map(response => {
        if (response.success && Array.isArray(response.data)) {
          return response.data;
        }
        throw new Error(response.message || 'Error al obtener permisos del rol');
      }),
      catchError(this.handleError)
    );
  }

  // Obtener permisos por módulo
  getByModulo(moduloId: number): Observable<Permiso[]> {
    return this.http.get<PermisoResponse>(`${this.API_URL}/modulo/${moduloId}`, { headers: this.getHeaders() }).pipe(
      map(response => {
        if (response.success && Array.isArray(response.data)) {
          return response.data;
        }
        throw new Error(response.message || 'Error al obtener permisos del módulo');
      }),
      catchError(this.handleError)
    );
  }

  // Obtener permiso por rol y módulo
  getByRolModulo(rolId: number, moduloId: number): Observable<Permiso | null> {
    return this.http.get<PermisoResponse>(`${this.API_URL}/rol/${rolId}/modulo/${moduloId}`, { headers: this.getHeaders() }).pipe(
      map(response => {
        if (response.success) {
          return response.data as Permiso | null;
        }
        throw new Error(response.message || 'Error al obtener permiso');
      }),
      catchError(this.handleError)
    );
  }

  // Crear permiso
  create(permiso: PermisoCreate): Observable<Permiso> {
    return this.http.post<PermisoResponse>(this.API_URL, permiso, { headers: this.getHeaders() }).pipe(
      map(response => {
        if (response.success && response.data && !Array.isArray(response.data)) {
          return response.data;
        }
        throw new Error(response.message || 'Error al crear permiso');
      }),
      catchError(this.handleError)
    );
  }

  // Crear permisos por lote
  createBatch(batch: PermisoBatch): Observable<Permiso[]> {
    return this.http.post<PermisoResponse>(`${this.API_URL}/batch`, batch, { headers: this.getHeaders() }).pipe(
      map(response => {
        if (response.success && Array.isArray(response.data)) {
          return response.data;
        }
        throw new Error(response.message || 'Error al crear permisos por lote');
      }),
      catchError(this.handleError)
    );
  }

  // Actualizar permiso
  update(id: number, permiso: PermisoUpdate): Observable<Permiso> {
    return this.http.put<PermisoResponse>(`${this.API_URL}/${id}`, permiso, { headers: this.getHeaders() }).pipe(
      map(response => {
        if (response.success && response.data && !Array.isArray(response.data)) {
          return response.data;
        }
        throw new Error(response.message || 'Error al actualizar permiso');
      }),
      catchError(this.handleError)
    );
  }

  // Actualizar permisos por rol
  updateByRol(rolId: number, permisos: PermisoCreate[]): Observable<Permiso[]> {
    return this.http.put<PermisoResponse>(`${this.API_URL}/rol/${rolId}`, { permisos }, { headers: this.getHeaders() }).pipe(
      map(response => {
        if (response.success && Array.isArray(response.data)) {
          return response.data;
        }
        throw new Error(response.message || 'Error al actualizar permisos del rol');
      }),
      catchError(this.handleError)
    );
  }

  // Eliminar permiso
  delete(id: number): Observable<any> {
    return this.http.delete<PermisoResponse>(`${this.API_URL}/${id}`, { headers: this.getHeaders() }).pipe(
      map(response => {
        if (response.success) {
          return response;
        }
        throw new Error(response.message || 'Error al eliminar permiso');
      }),
      catchError(this.handleError)
    );
  }

  // Verificar si un rol puede hacer una acción
  canDoAction(rolId: number, modulo: string, accion: string): Observable<PermisoCanDo> {
    return this.http.get<PermisoResponse>(`${this.API_URL}/can/${rolId}/${modulo}/${accion}`, { headers: this.getHeaders() }).pipe(
      map(response => {
        if (response.success && response.data && !Array.isArray(response.data)) {
          return response.data as unknown as PermisoCanDo;
        }
        throw new Error(response.message || 'Error al verificar permiso');
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('Permisos Service Error:', error);
    let errorMessage = 'Ocurrió un error desconocido.';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
