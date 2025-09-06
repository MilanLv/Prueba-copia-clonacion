export interface Permiso {
  id: number;
  id_rol: number;
  id_modulo: number;
  puede_crear: boolean;
  puede_leer: boolean;
  puede_actualizar: boolean;
  puede_eliminar: boolean;
  rol_nombre?: string;
  rol_descripcion?: string;
  rol_activo?: boolean;
  modulo_nombre?: string;
  modulo_descripcion?: string;
  modulo_activo?: boolean;
}

export interface PermisoCreate {
  id_rol: number;
  id_modulo: number;
  puede_crear?: boolean;
  puede_leer?: boolean;
  puede_actualizar?: boolean;
  puede_eliminar?: boolean;
}

export interface PermisoUpdate {
  id_rol?: number;
  id_modulo?: number;
  puede_crear?: boolean;
  puede_leer?: boolean;
  puede_actualizar?: boolean;
  puede_eliminar?: boolean;
}

export interface PermisoResponse {
  success: boolean;
  data: Permiso | Permiso[] | null;
  message: string;
}

export interface PermisoMatrix {
  id?: number;
  rol_id: number;
  rol_nombre: string;
  modulo_id: number;
  modulo_nombre: string;
  puede_crear: boolean;
  puede_leer: boolean;
  puede_actualizar: boolean;
  puede_eliminar: boolean;
  // Campos adicionales para compatibilidad con Permiso
  id_rol?: number;
  id_modulo?: number;
  rol_descripcion?: string;
  rol_activo?: boolean;
  modulo_descripcion?: string;
  modulo_activo?: boolean;
}

export interface PermisoBatch {
  id_rol: number;
  permisos: PermisoCreate[];
}

export interface PermisoCanDo {
  rol_id: number;
  modulo: string;
  accion: string;
  puede_hacer: boolean;
}
