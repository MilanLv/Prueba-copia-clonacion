export interface Usuario {
  id: number;
  ci: string;
  nombre_completo: string;
  telefono: string;
  correo: string;
  id_rol: number;
  activo: boolean;
  ultimo_acceso?: string;
  create_date?: string;
  update_date?: string;
  rol_nombre?: string;
  rol_descripcion?: string;
  total_ventas?: number;
  total_cotizaciones?: number;
}

export interface UsuarioCreate {
  ci: string;
  nombre_completo: string;
  telefono?: string;
  correo: string;
  password: string;
  id_rol: number;
  activo?: boolean;
}

export interface UsuarioUpdate {
  ci: string;
  nombre_completo: string;
  telefono?: string;
  correo: string;
  id_rol: number;
  activo?: boolean;
}

export interface UsuarioPasswordChange {
  current_password: string;
  new_password: string;
}

export interface UsuarioStats {
  total_usuarios: number;
  usuarios_activos: number;
  usuarios_inactivos: number;
  activos_ultimo_mes: number;
  roles_utilizados: number;
}

export interface UsuarioTopActive {
  id: number;
  ci: string;
  nombre_completo: string;
  rol_nombre: string;
  total_operaciones: number;
  total_ventas: number;
  total_cotizaciones: number;
  ultimo_acceso: string;
}
