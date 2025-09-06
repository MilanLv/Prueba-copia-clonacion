import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PermisosService } from '../../../shared/services/permisos.service';
import { RolesService } from '../../../shared/services/roles.service';
import { ModulosService } from '../../../shared/services/modulos.service';
import { Permiso, PermisoMatrix, PermisoCreate, PermisoUpdate } from '../../../shared/models/permiso.model';
import { Rol } from '../../../shared/models/rol.model';
import { Modulo } from '../../../shared/models/modulo.model';

@Component({
  selector: 'app-permisos-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './permisos-list.component.html',
  styleUrl: './permisos-list.component.css'
})
export class PermisosListComponent implements OnInit {
  permisos: Permiso[] = [];
  matrix: PermisoMatrix[] = [];
  roles: Rol[] = [];
  modulos: Modulo[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  selectedRol = '';
  selectedModulo = '';
  showMatrix = true; // Mostrar matriz por defecto
  permisosMatrix: { [key: string]: { [key: string]: Permiso | null } } = {};
  selectedRoleForEdit: number | null = null;

  constructor(
    private permisosService: PermisosService,
    private rolesService: RolesService,
    private modulosService: ModulosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🔍 PermisosListComponent - ngOnInit iniciado');
    this.loadMatrix();
    this.loadRoles();
    this.loadModulos();
  }

  loadPermisos(): void {
    console.log('🔍 PermisosListComponent - loadPermisos iniciado');
    this.loading = true;
    this.error = '';
    
    this.permisosService.getAll().subscribe({
      next: (data) => {
        console.log('✅ PermisosListComponent - loadPermisos SUCCESS:', data);
        console.log('📊 PermisosListComponent - Tipo de data:', typeof data);
        console.log('📊 PermisosListComponent - Es array:', Array.isArray(data));
        console.log('📊 PermisosListComponent - Longitud:', data?.length);
        
        // Los permisos ya vienen como array desde el servicio
        this.permisos = data;
        this.buildPermisosMatrix();
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ PermisosListComponent - loadPermisos ERROR:', error);
        console.error('❌ PermisosListComponent - Error details:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          url: error.url
        });
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  loadMatrix(): void {
    console.log('🔍 PermisosListComponent - loadMatrix iniciado');
    this.loading = true;
    this.error = '';
    
    this.permisosService.getMatrix().subscribe({
      next: (data) => {
        console.log('✅ PermisosListComponent - loadMatrix SUCCESS:', data);
        console.log('📊 PermisosListComponent - Matrix data:', data);
        console.log('📊 PermisosListComponent - Matrix es array:', Array.isArray(data));
        console.log('📊 PermisosListComponent - Matrix longitud:', data?.length);
        
        this.matrix = data;
        this.buildPermisosMatrix();
        this.showMatrix = true;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ PermisosListComponent - loadMatrix ERROR:', error);
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  loadRoles(): void {
    console.log('🔍 PermisosListComponent - loadRoles iniciado');
    
    this.rolesService.getAll().subscribe({
      next: (response) => {
        console.log('✅ PermisosListComponent - loadRoles SUCCESS:', response);
        console.log('📊 PermisosListComponent - Response success:', response.success);
        console.log('📊 PermisosListComponent - Response data:', response.data);
        console.log('📊 PermisosListComponent - Data es array:', Array.isArray(response.data));
        console.log('📊 PermisosListComponent - Longitud data:', response.data?.length);
        
        // Extraer el array de datos del objeto de respuesta
        const data = response.success && response.data ? response.data : [];
        this.roles = Array.isArray(data) ? data : [];
        console.log('📊 PermisosListComponent - Roles asignados:', this.roles);
      },
      error: (error) => {
        console.error('❌ PermisosListComponent - loadRoles ERROR:', error);
        console.error('❌ PermisosListComponent - Error details roles:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          url: error.url
        });
        this.roles = [];
      }
    });
  }

  loadModulos(): void {
    console.log('🔍 PermisosListComponent - loadModulos iniciado');
    
    this.modulosService.getAll().subscribe({
      next: (response) => {
        console.log('✅ PermisosListComponent - loadModulos SUCCESS:', response);
        console.log('📊 PermisosListComponent - Response success:', response.success);
        console.log('📊 PermisosListComponent - Response data:', response.data);
        console.log('📊 PermisosListComponent - Data es array:', Array.isArray(response.data));
        console.log('📊 PermisosListComponent - Longitud data:', response.data?.length);
        
        // Extraer el array de datos del objeto de respuesta
        const data = response.success && response.data ? response.data : [];
        this.modulos = Array.isArray(data) ? data : [];
        console.log('📊 PermisosListComponent - Modulos asignados:', this.modulos);
      },
      error: (error) => {
        console.error('❌ PermisosListComponent - loadModulos ERROR:', error);
        console.error('❌ PermisosListComponent - Error details modulos:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          url: error.url
        });
        this.modulos = [];
      }
    });
  }

  get filteredPermisos(): Permiso[] {
    let filtered = this.permisos;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.rol_nombre?.toLowerCase().includes(term) ||
        p.modulo_nombre?.toLowerCase().includes(term)
      );
    }

    if (this.selectedRol) {
      filtered = filtered.filter(p => p.id_rol === parseInt(this.selectedRol));
    }

    if (this.selectedModulo) {
      filtered = filtered.filter(p => p.id_modulo === parseInt(this.selectedModulo));
    }

    return filtered;
  }

  get uniqueRoles(): Rol[] {
    return this.roles.filter(rol => 
      this.permisos.some(p => p.id_rol === rol.id)
    );
  }

  get uniqueModulos(): Modulo[] {
    return this.modulos.filter(modulo => 
      this.permisos.some(p => p.id_modulo === modulo.id)
    );
  }

  goToNewPermiso(): void {
    this.router.navigate(['/permisos/nuevo']);
  }

  goToEditPermiso(id: number): void {
    this.router.navigate(['/permisos/editar', id]);
  }

  goToDetailPermiso(id: number): void {
    this.router.navigate(['/permisos/detalle', id]);
  }

  deletePermiso(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este permiso?')) {
      this.permisosService.delete(id).subscribe({
        next: () => {
          this.loadMatrix();
        },
        error: (error) => {
          this.error = error.message;
        }
      });
    }
  }

  toggleMatrix(): void {
    if (this.showMatrix) {
      this.showMatrix = false;
    } else {
      this.loadMatrix();
    }
  }

  getPermisoIcon(permiso: string): string {
    switch (permiso) {
      case 'crear': return 'fas fa-plus';
      case 'leer': return 'fas fa-eye';
      case 'actualizar': return 'fas fa-edit';
      case 'eliminar': return 'fas fa-trash';
      default: return 'fas fa-question';
    }
  }

  getPermisoColor(permiso: string, tienePermiso: boolean): string {
    if (!tienePermiso) return 'text-gray-400';
    
    switch (permiso) {
      case 'crear': return 'text-green-600';
      case 'leer': return 'text-blue-600';
      case 'actualizar': return 'text-yellow-600';
      case 'eliminar': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  getPermisoForRolModulo(rolId: number, moduloId: number): Permiso | undefined {
    return this.permisos.find(p => p.id_rol === rolId && p.id_modulo === moduloId);
  }

  // Construir matriz de permisos
  buildPermisosMatrix(): void {
    console.log('🔍 PermisosListComponent - buildPermisosMatrix iniciado');
    console.log('📊 PermisosListComponent - Matrix data:', this.matrix);
    console.log('📊 PermisosListComponent - Roles disponibles:', this.roles);
    console.log('📊 PermisosListComponent - Modulos disponibles:', this.modulos);
    
    this.permisosMatrix = {};
    
    if (Array.isArray(this.matrix) && this.matrix.length > 0) {
      console.log('✅ PermisosListComponent - Construyendo matriz con', this.matrix.length, 'permisos');
      
      // Extraer roles y módulos únicos de la matriz
      const rolesMap = new Map();
      const modulosMap = new Map();
      
      this.matrix.forEach(item => {
        if (!rolesMap.has(item.rol_id)) {
          rolesMap.set(item.rol_id, {
            id: item.rol_id,
            nombre: item.rol_nombre
          });
        }
        if (!modulosMap.has(item.modulo_id)) {
          modulosMap.set(item.modulo_id, {
            id: item.modulo_id,
            nombre: item.modulo_nombre
          });
        }
      });
      
      // Actualizar roles y módulos del componente
      this.roles = Array.from(rolesMap.values());
      this.modulos = Array.from(modulosMap.values());
      
      // Construir matriz de permisos
      this.roles.forEach(rol => {
        this.permisosMatrix[rol.id] = {};
        this.modulos.forEach(modulo => {
          const permiso = this.matrix.find(p => p.rol_id === rol.id && p.modulo_id === modulo.id);
          if (permiso) {
            // Mapear PermisoMatrix a Permiso
            const permisoMapeado: Permiso = {
              id: permiso.id || 0,
              id_rol: permiso.rol_id,
              id_modulo: permiso.modulo_id,
              puede_crear: permiso.puede_crear,
              puede_leer: permiso.puede_leer,
              puede_actualizar: permiso.puede_actualizar,
              puede_eliminar: permiso.puede_eliminar,
              rol_nombre: permiso.rol_nombre,
              modulo_nombre: permiso.modulo_nombre
            };
            this.permisosMatrix[rol.id][modulo.id] = permisoMapeado;
          } else {
            this.permisosMatrix[rol.id][modulo.id] = null;
          }
        });
      });
      
      console.log('✅ PermisosListComponent - Matriz construida:', this.permisosMatrix);
      console.log('✅ PermisosListComponent - Roles extraídos:', this.roles);
      console.log('✅ PermisosListComponent - Modulos extraídos:', this.modulos);
    } else {
      console.warn('⚠️ PermisosListComponent - No se puede construir la matriz - Matrix no es array o está vacía');
      console.warn('⚠️ PermisosListComponent - Matrix es array:', Array.isArray(this.matrix));
      console.warn('⚠️ PermisosListComponent - Matrix longitud:', this.matrix?.length);
    }
  }

  // Verificar si un permiso específico está habilitado
  hasPermission(rolId: number, moduloId: number, permission: string): boolean {
    const permiso = this.permisosMatrix[rolId]?.[moduloId];
    if (!permiso) return false;
    
    switch (permission) {
      case 'crear': return permiso.puede_crear || false;
      case 'leer': return permiso.puede_leer || false;
      case 'actualizar': return permiso.puede_actualizar || false;
      case 'eliminar': return permiso.puede_eliminar || false;
      default: return false;
    }
  }

  // Toggle de permiso
  togglePermission(rolId: number, moduloId: number, permission: string): void {
    console.log('🔍 PermisosListComponent - togglePermission:', { rolId, moduloId, permission });
    
    const permiso = this.permisosMatrix[rolId]?.[moduloId];
    const currentValue = this.hasPermission(rolId, moduloId, permission);
    const newValue = !currentValue;
    
    console.log('📊 PermisosListComponent - Permiso actual:', permiso);
    console.log('📊 PermisosListComponent - Valor actual:', currentValue);
    console.log('📊 PermisosListComponent - Nuevo valor:', newValue);
    
    if (permiso && permiso.id) {
      // Actualizar permiso existente
      const updateData: PermisoUpdate = {
        id_rol: rolId,
        id_modulo: moduloId,
        puede_crear: permission === 'crear' ? newValue : (permiso.puede_crear || false),
        puede_leer: permission === 'leer' ? newValue : (permiso.puede_leer || false),
        puede_actualizar: permission === 'actualizar' ? newValue : (permiso.puede_actualizar || false),
        puede_eliminar: permission === 'eliminar' ? newValue : (permiso.puede_eliminar || false)
      };
      
      console.log('📊 PermisosListComponent - Actualizando permiso:', updateData);
      
      this.permisosService.update(permiso.id, updateData).subscribe({
        next: (updatedPermiso) => {
          console.log('✅ PermisosListComponent - Permiso actualizado:', updatedPermiso);
          // Actualizar la matriz local
          this.permisosMatrix[rolId][moduloId] = updatedPermiso;
          // Recargar matriz para sincronizar
          this.loadMatrix();
        },
        error: (error) => {
          console.error('❌ PermisosListComponent - Error actualizando permiso:', error);
          this.error = error.message;
        }
      });
    } else {
      // Crear nuevo permiso
      const createData: PermisoCreate = {
        id_rol: rolId,
        id_modulo: moduloId,
        puede_crear: permission === 'crear' ? newValue : false,
        puede_leer: permission === 'leer' ? newValue : false,
        puede_actualizar: permission === 'actualizar' ? newValue : false,
        puede_eliminar: permission === 'eliminar' ? newValue : false
      };
      
      console.log('📊 PermisosListComponent - Creando permiso:', createData);
      
      this.permisosService.create(createData).subscribe({
        next: (newPermiso) => {
          console.log('✅ PermisosListComponent - Permiso creado:', newPermiso);
          // Actualizar la matriz local
          this.permisosMatrix[rolId][moduloId] = newPermiso;
          // Recargar matriz para sincronizar
          this.loadMatrix();
        },
        error: (error) => {
          console.error('❌ PermisosListComponent - Error creando permiso:', error);
          this.error = error.message;
        }
      });
    }
  }

  // Seleccionar rol para edición masiva
  selectRoleForEdit(rolId: number): void {
    this.selectedRoleForEdit = this.selectedRoleForEdit === rolId ? null : rolId;
  }

  // Aplicar permisos masivos a un rol
  applyBulkPermissions(rolId: number, moduloId: number, permissions: { [key: string]: boolean }): void {
    const permiso = this.permisosMatrix[rolId]?.[moduloId];
    
    if (permiso) {
      // Actualizar permiso existente
      this.permisosService.update(permiso.id, permissions).subscribe({
        next: (updatedPermiso) => {
          this.permisosMatrix[rolId][moduloId] = updatedPermiso;
          this.loadPermisos();
        },
        error: (error) => {
          this.error = error.message;
        }
      });
    } else {
      // Crear nuevo permiso
      const createData: PermisoCreate = {
        id_rol: rolId,
        id_modulo: moduloId,
        ...permissions
      };
      
      this.permisosService.create(createData).subscribe({
        next: (newPermiso) => {
          this.permisosMatrix[rolId][moduloId] = newPermiso;
          this.loadPermisos();
        },
        error: (error) => {
          this.error = error.message;
        }
      });
    }
  }

  // Obtener permisos de un rol específico
  getRolePermissions(rolId: number): { [key: string]: { [key: string]: boolean } } {
    const rolePermissions: { [key: string]: { [key: string]: boolean } } = {};
    this.modulos.forEach(modulo => {
      const permiso = this.permisosMatrix[rolId]?.[modulo.id];
      if (permiso) {
        rolePermissions[modulo.id] = {
          crear: permiso.puede_crear,
          leer: permiso.puede_leer,
          actualizar: permiso.puede_actualizar,
          eliminar: permiso.puede_eliminar
        };
      }
    });
    return rolePermissions;
  }

  // TrackBy functions para optimizar el rendering
  trackByRolId(index: number, rol: any): any {
    return rol ? rol.id : index;
  }

  trackByModuloId(index: number, modulo: any): any {
    return modulo ? modulo.id : index;
  }
}
