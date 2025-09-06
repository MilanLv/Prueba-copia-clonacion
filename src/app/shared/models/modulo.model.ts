export interface Modulo {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  total_permisos?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ModuloCreate {
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface ModuloUpdate {
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface ModuloResponse {
  success: boolean;
  data: Modulo;
  message: string;
}

export interface ModulosResponse {
  success: boolean;
  data: Modulo[];
  message: string;
}

export interface ModuloRolesResponse {
  success: boolean;
  data: {
    modulo: {
      id: number;
      nombre: string;
      descripcion: string;
    };
    roles: Array<{
      id: number;
      nombre: string;
      descripcion: string;
      puede_crear: boolean;
      puede_leer: boolean;
      puede_actualizar: boolean;
      puede_eliminar: boolean;
    }>;
  };
  message: string;
}
