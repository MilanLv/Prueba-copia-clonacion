import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PermisosService } from '../../../shared/services/permisos.service';
import { RolesService } from '../../../shared/services/roles.service';
import { ModulosService } from '../../../shared/services/modulos.service';
import { Permiso, PermisoCreate, PermisoUpdate } from '../../../shared/models/permiso.model';
import { Rol } from '../../../shared/models/rol.model';
import { Modulo } from '../../../shared/models/modulo.model';

@Component({
  selector: 'app-permisos-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './permisos-modal.component.html',
  styleUrl: './permisos-modal.component.css'
})
export class PermisosModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() mode: 'create' | 'edit' | 'delete' = 'create';
  @Input() permiso: Permiso | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<Permiso>();

  permisoForm: FormGroup;
  roles: Rol[] = [];
  modulos: Modulo[] = [];
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private permisosService: PermisosService,
    private rolesService: RolesService,
    private modulosService: ModulosService
  ) {
    this.permisoForm = this.fb.group({
      id_rol: ['', Validators.required],
      id_modulo: ['', Validators.required],
      puede_crear: [false],
      puede_leer: [false],
      puede_actualizar: [false],
      puede_eliminar: [false]
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    this.loadModulos();
  }

  ngOnChanges(): void {
    if (this.permiso && this.mode === 'edit') {
      this.permisoForm.patchValue({
        id_rol: this.permiso.id_rol,
        id_modulo: this.permiso.id_modulo,
        puede_crear: this.permiso.puede_crear,
        puede_leer: this.permiso.puede_leer,
        puede_actualizar: this.permiso.puede_actualizar,
        puede_eliminar: this.permiso.puede_eliminar
      });
    } else if (this.mode === 'create') {
      this.permisoForm.reset();
    }
  }

  loadRoles(): void {
    this.rolesService.getAll().subscribe({
      next: (data) => {
        this.roles = data.filter((rol: any) => rol.activo);
      },
      error: (error) => {
        this.error = 'Error al cargar roles: ' + error.message;
      }
    });
  }

  loadModulos(): void {
    this.modulosService.getAll().subscribe({
      next: (data) => {
        this.modulos = (data as any).filter((modulo: any) => modulo.activo);
      },
      error: (error) => {
        this.error = 'Error al cargar módulos: ' + error.message;
      }
    });
  }

  onSubmit(): void {
    if (this.mode === 'delete') {
      this.deletePermiso();
      return;
    }

    if (this.permisoForm.valid) {
      this.loading = true;
      this.error = '';

      const formData = this.permisoForm.value;

      if (this.mode === 'edit' && this.permiso) {
        const updateData: PermisoUpdate = {
          id_rol: formData.id_rol,
          id_modulo: formData.id_modulo,
          puede_crear: formData.puede_crear,
          puede_leer: formData.puede_leer,
          puede_actualizar: formData.puede_actualizar,
          puede_eliminar: formData.puede_eliminar
        };

        this.permisosService.update(this.permiso.id, updateData).subscribe({
          next: (updatedPermiso) => {
            this.success.emit(updatedPermiso);
            this.closeModal();
          },
          error: (error) => {
            this.error = error.message;
            this.loading = false;
          }
        });
      } else if (this.mode === 'create') {
        const createData: PermisoCreate = {
          id_rol: formData.id_rol,
          id_modulo: formData.id_modulo,
          puede_crear: formData.puede_crear,
          puede_leer: formData.puede_leer,
          puede_actualizar: formData.puede_actualizar,
          puede_eliminar: formData.puede_eliminar
        };

        this.permisosService.create(createData).subscribe({
          next: (newPermiso) => {
            this.success.emit(newPermiso);
            this.closeModal();
          },
          error: (error) => {
            this.error = error.message;
            this.loading = false;
          }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  deletePermiso(): void {
    if (this.permiso) {
      this.loading = true;
      this.error = '';

      this.permisosService.delete(this.permiso.id).subscribe({
        next: () => {
          this.success.emit();
          this.closeModal();
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
    }
  }

  closeModal(): void {
    this.permisoForm.reset();
    this.error = '';
    this.loading = false;
    this.close.emit();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.permisoForm.controls).forEach(key => {
      const control = this.permisoForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.permisoForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
      }
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'id_rol': 'Rol',
      'id_modulo': 'Módulo',
      'puede_crear': 'Crear',
      'puede_leer': 'Leer',
      'puede_actualizar': 'Actualizar',
      'puede_eliminar': 'Eliminar'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.permisoForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }

  getTitle(): string {
    switch (this.mode) {
      case 'create': return 'Nuevo Permiso';
      case 'edit': return 'Editar Permiso';
      case 'delete': return 'Eliminar Permiso';
      default: return 'Permiso';
    }
  }

  getSubmitText(): string {
    switch (this.mode) {
      case 'create': return 'Crear';
      case 'edit': return 'Actualizar';
      case 'delete': return 'Eliminar';
      default: return 'Guardar';
    }
  }

  getSubmitClass(): string {
    switch (this.mode) {
      case 'create': return 'bg-blue-600 hover:bg-blue-700';
      case 'edit': return 'bg-yellow-600 hover:bg-yellow-700';
      case 'delete': return 'bg-red-600 hover:bg-red-700';
      default: return 'bg-blue-600 hover:bg-blue-700';
    }
  }
}
