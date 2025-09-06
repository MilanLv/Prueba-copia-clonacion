import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RolesService } from '../../../shared/services/roles.service';
import { Rol, RolCreate, RolUpdate } from '../../../shared/models/rol.model';

@Component({
  selector: 'app-roles-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './roles-form.component.html',
  styleUrl: './roles-form.component.css'
})
export class RolesFormComponent implements OnInit {
  @Input() rol: Rol | null = null;
  @Input() isEdit = false;
  @Output() save = new EventEmitter<Rol>();
  @Output() cancel = new EventEmitter<void>();

  rolForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private rolesService: RolesService
  ) {
    this.rolForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.rol && this.isEdit) {
      this.loadRolData();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: [''],
      activo: [true]
    });
  }

  loadRolData(): void {
    if (this.rol) {
      this.rolForm.patchValue({
        nombre: this.rol.nombre,
        descripcion: this.rol.descripcion,
        activo: this.rol.activo
      });
    }
  }

  onSubmit(): void {
    if (this.rolForm.valid) {
      this.loading = true;
      this.error = '';

      const formData = this.rolForm.value;

      if (this.isEdit && this.rol) {
        // Actualizar rol
        const updateData: RolUpdate = {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          activo: formData.activo
        };

        this.rolesService.update(this.rol.id, updateData).subscribe({
          next: (response) => {
            if (response.success) {
              this.save.emit(response.data);
            } else {
              this.error = response.message;
            }
            this.loading = false;
          },
          error: (error) => {
            this.error = 'Error al actualizar rol';
            this.loading = false;
            console.error('Error:', error);
          }
        });
      } else {
        // Crear rol
        const createData: RolCreate = {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          activo: formData.activo
        };

        this.rolesService.create(createData).subscribe({
          next: (response) => {
            if (response.success) {
              this.save.emit(response.data);
            } else {
              this.error = response.message;
            }
            this.loading = false;
          },
          error: (error) => {
            this.error = 'Error al crear rol';
            this.loading = false;
            console.error('Error:', error);
          }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  markFormGroupTouched(): void {
    Object.keys(this.rolForm.controls).forEach(key => {
      const control = this.rolForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.rolForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} debe tener al menos ${requiredLength} caracteres`;
      }
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nombre: 'Nombre del rol',
      descripcion: 'Descripción'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.rolForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }
}
