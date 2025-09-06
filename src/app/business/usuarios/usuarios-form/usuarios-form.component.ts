import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuariosService } from '../../../shared/services/usuarios.service';
import { RolesService } from '../../../shared/services/roles.service';
import { Usuario, UsuarioCreate, UsuarioUpdate } from '../../../shared/models/usuario.model';
import { Rol } from '../../../shared/models/rol.model';

@Component({
  selector: 'app-usuarios-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './usuarios-form.component.html',
  styleUrl: './usuarios-form.component.css'
})
export class UsuariosFormComponent implements OnInit {
  @Input() usuario: Usuario | null = null;
  @Input() isEdit = false;
  @Output() save = new EventEmitter<Usuario>();
  @Output() cancel = new EventEmitter<void>();

  usuarioForm: FormGroup;
  roles: Rol[] = [];
  loading = false;
  error = '';
  usuarioId: number = 0;

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private rolesService: RolesService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.usuarioForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadRoles();
    
    // Verificar si estamos en modo edición desde la ruta
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.usuarioId = +id;
      this.loadUsuarioForEdit();
    }
    
    if (this.usuario && this.isEdit) {
      this.loadUsuarioData();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      ci: ['', [Validators.required, Validators.minLength(6)]],
      nombre_completo: ['', [Validators.required, Validators.minLength(2)]],
      telefono: [''],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', this.isEdit ? [] : [Validators.required, Validators.minLength(6)]],
      id_rol: ['', [Validators.required]],
      activo: [true]
    });
  }

  loadRoles(): void {
    this.rolesService.getActive().subscribe({
      next: (response) => {
        if (response.success) {
          this.roles = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
      }
    });
  }

  loadUsuarioForEdit(): void {
    this.loading = true;
    this.usuariosService.getById(this.usuarioId).subscribe({
      next: (response) => {
        if (response.success) {
          this.usuario = response.data;
          this.loadUsuarioData();
        } else {
          this.error = response.message;
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar usuario';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  loadUsuarioData(): void {
    if (this.usuario) {
      this.usuarioForm.patchValue({
        ci: this.usuario.ci,
        nombre_completo: this.usuario.nombre_completo,
        telefono: this.usuario.telefono,
        correo: this.usuario.correo,
        id_rol: this.usuario.id_rol,
        activo: this.usuario.activo
      });
    }
  }

  onSubmit(): void {
    if (this.usuarioForm.valid) {
      this.loading = true;
      this.error = '';

      const formData = this.usuarioForm.value;

      if (this.isEdit && this.usuario) {
        // Actualizar usuario
        const updateData: UsuarioUpdate = {
          ci: formData.ci,
          nombre_completo: formData.nombre_completo,
          telefono: formData.telefono,
          correo: formData.correo,
          id_rol: formData.id_rol,
          activo: formData.activo
        };

        this.usuariosService.update(this.usuario.id, updateData).subscribe({
          next: (response) => {
            if (response.success) {
              this.save.emit(response.data);
              this.router.navigate(['/usuarios']);
            } else {
              this.error = response.message;
            }
            this.loading = false;
          },
          error: (error) => {
            this.error = 'Error al actualizar usuario';
            this.loading = false;
            console.error('Error:', error);
          }
        });
      } else {
        // Crear usuario
        const createData: UsuarioCreate = {
          ci: formData.ci,
          nombre_completo: formData.nombre_completo,
          telefono: formData.telefono,
          correo: formData.correo,
          password: formData.password,
          id_rol: formData.id_rol,
          activo: formData.activo
        };

        this.usuariosService.create(createData).subscribe({
          next: (response) => {
            if (response.success) {
              this.save.emit(response.data);
              this.router.navigate(['/usuarios']);
            } else {
              this.error = response.message;
            }
            this.loading = false;
          },
          error: (error) => {
            this.error = 'Error al crear usuario';
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
    Object.keys(this.usuarioForm.controls).forEach(key => {
      const control = this.usuarioForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.usuarioForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
      }
      if (field.errors['email']) {
        return 'Formato de correo inválido';
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
      ci: 'CI',
      nombre_completo: 'Nombre completo',
      telefono: 'Teléfono',
      correo: 'Correo',
      password: 'Contraseña',
      id_rol: 'Rol'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.usuarioForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }
}
