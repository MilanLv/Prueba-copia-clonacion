export interface LoginRequest {
  credential: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: number;
      ci: string;
      nombre_completo: string;
      correo: string;
      id_rol: number;
      rol_nombre: string;
      rol_descripcion?: string;
    };
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: string;
    loginTime: string;
  };
}

export interface UserProfile {
  id: number;
  ci: string;
  nombre_completo: string;
  correo: string;
  id_rol: number;
  rol_nombre: string;
  rol_descripcion?: string;
}

export interface TokenPayload {
  userId: number;
  ci: string;
  nombre_completo: string;
  correo: string;
  id_rol: number;
  rol_nombre: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: string;
  };
}

export interface ChangePasswordRequest {
  userId: number;
  currentPassword: string;
  newPassword: string;
}
