import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PermisosService } from '../../../shared/services/permisos.service';
import { RolesService } from '../../../shared/services/roles.service';
import { ModulosService } from '../../../shared/services/modulos.service';
import { PermisoCreate, PermisoUpdate } from '../../../shared/models/permiso.model';
import { Rol } from '../../../shared/models/rol.model';
import { Modulo } from '../../../shared/models/modulo.model';

@Component({
  selector: 'app-permisos-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './permisos-form.component.html',
  styleUrl: './permisos-form.component.css'
})
export class PermisosFormComponent implements OnInit {
  permisoForm: FormGroup;
  roles: Rol[] = [];
  modulos: Modulo[] = [];
  loading = false;
  error = '';
  isEdit = false;
  permisoId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private permisosService: PermisosService,
    private rolesService: RolesService,
    private modulosService: ModulosService,
    private route: ActivatedRoute,
    private router: Router
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
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.permisoId = parseInt(id);
      this.loadPermisoForEdit();
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

  loadPermisoForEdit(): void {
    if (!this.permisoId) return;

    this.loading = true;
    this.permisosService.getById(this.permisoId).subscribe({
      next: (permiso) => {
        this.permisoForm.patchValue({
          id_rol: permiso.id_rol,
          id_modulo: permiso.id_modulo,
          puede_crear: permiso.puede_crear,
          puede_leer: permiso.puede_leer,
          puede_actualizar: permiso.puede_actualizar,
          puede_eliminar: permiso.puede_eliminar
        });
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.permisoForm.valid) {
      this.loading = true;
      this.error = '';

      const formData = this.permisoForm.value;

      if (this.isEdit && this.permisoId) {
        const updateData: PermisoUpdate = {
          id_rol: formData.id_rol,
          id_modulo: formData.id_modulo,
          puede_crear: formData.puede_crear,
          puede_leer: formData.puede_leer,
          puede_actualizar: formData.puede_actualizar,
          puede_eliminar: formData.puede_eliminar
        };

        this.permisosService.update(this.permisoId, updateData).subscribe({
          next: () => {
            this.router.navigate(['/permisos']);
          },
          error: (error) => {
            this.error = error.message;
            this.loading = false;
          }
        });
      } else {
        const createData: PermisoCreate = {
          id_rol: formData.id_rol,
          id_modulo: formData.id_modulo,
          puede_crear: formData.puede_crear,
          puede_leer: formData.puede_leer,
          puede_actualizar: formData.puede_actualizar,
          puede_eliminar: formData.puede_eliminar
        };

        this.permisosService.create(createData).subscribe({
          next: () => {
            this.router.navigate(['/permisos']);
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

  onCancel(): void {
    this.router.navigate(['/permisos']);
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
}
