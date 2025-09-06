import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModulosService } from '../../../shared/services/modulos.service';
import { Modulo, ModuloCreate, ModuloUpdate } from '../../../shared/models/modulo.model';

@Component({
  selector: 'app-modulos-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './modulos-form.component.html',
  styleUrl: './modulos-form.component.css'
})
export class ModulosFormComponent implements OnInit {
  @Input() modulo: Modulo | null = null;
  @Input() isEdit = false;
  @Output() save = new EventEmitter<Modulo>();
  @Output() cancel = new EventEmitter<void>();

  moduloForm: FormGroup;
  loading = false;
  error = '';
  moduloId: number = 0;

  constructor(
    private fb: FormBuilder,
    private modulosService: ModulosService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.moduloForm = this.createForm();
  }

  ngOnInit(): void {
    // Verificar si estamos en modo edición desde la ruta
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.moduloId = +id;
      this.loadModuloForEdit();
    }

    if (this.modulo && this.isEdit) {
      this.loadModuloData();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: [''],
      activo: [true]
    });
  }

  loadModuloForEdit(): void {
    this.loading = true;
    this.modulosService.getById(this.moduloId).subscribe({
      next: (response) => {
        if (response.success) {
          this.modulo = response.data;
          this.loadModuloData();
        } else {
          this.error = response.message;
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar módulo';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  loadModuloData(): void {
    if (this.modulo) {
      this.moduloForm.patchValue({
        nombre: this.modulo.nombre,
        descripcion: this.modulo.descripcion,
        activo: this.modulo.activo
      });
    }
  }

  onSubmit(): void {
    if (this.moduloForm.valid) {
      this.loading = true;
      this.error = '';

      const formData = this.moduloForm.value;

      if (this.isEdit && this.modulo) {
        // Actualizar módulo
        const updateData: ModuloUpdate = {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          activo: formData.activo
        };

        this.modulosService.update(this.modulo.id, updateData).subscribe({
          next: (response) => {
            if (response.success) {
              this.save.emit(response.data);
              this.router.navigate(['/modulos']);
            } else {
              this.error = response.message;
            }
            this.loading = false;
          },
          error: (error) => {
            this.error = 'Error al actualizar módulo';
            this.loading = false;
            console.error('Error:', error);
          }
        });
      } else {
        // Crear módulo
        const createData: ModuloCreate = {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          activo: formData.activo
        };

        this.modulosService.create(createData).subscribe({
          next: (response) => {
            if (response.success) {
              this.save.emit(response.data);
              this.router.navigate(['/modulos']);
            } else {
              this.error = response.message;
            }
            this.loading = false;
          },
          error: (error) => {
            this.error = 'Error al crear módulo';
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
    this.router.navigate(['/modulos']);
  }

  markFormGroupTouched(): void {
    Object.keys(this.moduloForm.controls).forEach(key => {
      const control = this.moduloForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.moduloForm.get(fieldName);
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
      nombre: 'Nombre',
      descripcion: 'Descripción',
      activo: 'Estado'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.moduloForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }
}
