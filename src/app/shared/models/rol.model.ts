export interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  total_usuarios?: number;
}

export interface RolCreate {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface RolUpdate {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}
