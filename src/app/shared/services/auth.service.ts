import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';
import { 
  LoginRequest, 
  LoginResponse, 
  UserProfile, 
  TokenPayload, 
  RefreshTokenRequest, 
  RefreshTokenResponse,
  ChangePasswordRequest 
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (token) {
      try {
        const payload = jwtDecode<TokenPayload>(token);
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          this.tokenSubject.next(token);
          this.currentUserSubject.next({
            id: payload.userId,
            ci: payload.ci,
            nombre_completo: payload.nombre_completo,
            correo: payload.correo,
            id_rol: payload.id_rol,
            rol_nombre: payload.rol_nombre
          });
        } else {
          this.clearAuth();
        }
      } catch (error) {
        this.clearAuth();
      }
    }

    if (refreshToken) {
      this.refreshTokenSubject.next(refreshToken);
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success) {
            this.setAuthData(response.data);
          }
        }),
        catchError(this.handleError)
      );
  }

  logout(): Observable<any> {
    const userId = this.currentUserSubject.value?.id;
    
    // Siempre limpiar la autenticación local, incluso si el servidor falla
    this.clearAuth();
    
    // Intentar notificar al servidor, pero no fallar si no funciona
    if (userId) {
      return this.http.post(`${this.API_URL}/logout`, { userId })
        .pipe(
          tap(() => console.log('Logout exitoso en servidor')),
          catchError(error => {
            console.warn('Error en logout del servidor, pero se limpió la sesión local:', error);
            return of({ success: true, message: 'Logout local exitoso' });
          })
        );
    } else {
      // Si no hay userId, solo limpiar localmente
      return of({ success: true, message: 'Logout local exitoso' });
    }
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.refreshTokenSubject.value;
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<RefreshTokenResponse>(`${this.API_URL}/refresh-token`, { refreshToken })
      .pipe(
        tap(response => {
          if (response.success) {
            this.setAuthData(response.data);
          }
        }),
        catchError(error => {
          this.clearAuth();
          return throwError(() => error);
        })
      );
  }

  getCurrentUser(): Observable<UserProfile | null> {
    return this.currentUser$;
  }

  getToken(): string | null {
    const token = this.tokenSubject.value;
    console.log('🔍 AuthService - getToken:', token ? 'Token encontrado' : 'No hay token');
    return token;
  }

  getAccessToken(): string | null {
    return this.tokenSubject.value;
  }

  getRefreshToken(): string | null {
    return this.refreshTokenSubject.value;
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.setAuthData({ accessToken, refreshToken });
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = jwtDecode<TokenPayload>(token);
      return payload.exp ? payload.exp * 1000 > Date.now() : false;
    } catch {
      return false;
    }
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = jwtDecode<TokenPayload>(token);
      return payload.exp ? payload.exp * 1000 <= Date.now() : true;
    } catch {
      return true;
    }
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.rol_nombre?.toLowerCase() === role.toLowerCase();
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    return roles.some(role => user.rol_nombre?.toLowerCase() === role.toLowerCase());
  }

  isAdmin(): boolean {
    return this.hasRole('administrador');
  }

  changePassword(request: ChangePasswordRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/change-password`, request)
      .pipe(catchError(this.handleError));
  }

  verifyToken(): Observable<any> {
    return this.http.post(`${this.API_URL}/verify-token`, {})
      .pipe(catchError(this.handleError));
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.API_URL}/me`)
      .pipe(catchError(this.handleError));
  }

  private setAuthData(data: any): void {
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      this.tokenSubject.next(data.accessToken);
    }

    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
      this.refreshTokenSubject.next(data.refreshToken);
    }

    if (data.user) {
      this.currentUserSubject.next(data.user);
    }
  }

  private clearAuth(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.tokenSubject.next(null);
    this.refreshTokenSubject.next(null);
    this.currentUserSubject.next(null);
  }

  private handleError(error: any): Observable<never> {
    console.error('Auth Service Error:', error);
    return throwError(() => error);
  }
}
