import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../../shared/services/usuarios.service';
import { Usuario } from '../../../shared/models/usuario.model';

export type ModalType = 'create' | 'edit' | 'delete' | 'toggle' | 'password';

@Component({
  selector: 'app-usuarios-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios-modal.component.html',
  styleUrl: './usuarios-modal.component.css'
})
export class UsuariosModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() modalType: ModalType = 'create';
  @Input() usuario: Usuario | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<any>();

  loading = false;
  error = '';
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit(): void {
    if (this.isOpen) {
      this.resetForm();
    }
  }

  get modalTitle(): string {
    switch (this.modalType) {
      case 'create': return 'Nuevo Usuario';
      case 'edit': return 'Editar Usuario';
      case 'delete': return 'Eliminar Usuario';
      case 'toggle': return this.usuario?.activo ? 'Desactivar Usuario' : 'Activar Usuario';
      case 'password': return 'Cambiar Contraseña';
      default: return 'Modal';
    }
  }

  get modalMessage(): string {
    switch (this.modalType) {
      case 'delete': 
        return `¿Estás seguro de que deseas eliminar al usuario "${this.usuario?.nombre_completo}"? Esta acción no se puede deshacer.`;
      case 'toggle': 
        return `¿Estás seguro de que deseas ${this.usuario?.activo ? 'desactivar' : 'activar'} al usuario "${this.usuario?.nombre_completo}"?`;
      case 'password':
        return 'Ingresa la contraseña actual y la nueva contraseña para el usuario.';
      default: return '';
    }
  }

  onClose(): void {
    this.close.emit();
    this.resetForm();
  }

  onConfirm(): void {
    if (this.modalType === 'password') {
      this.changePassword();
    } else if (this.modalType === 'toggle') {
      this.toggleUsuario();
    } else if (this.modalType === 'delete') {
      this.deleteUsuario();
    } else {
      this.confirm.emit();
    }
  }

  private changePassword(): void {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.error = 'Las contraseñas nuevas no coinciden';
      return;
    }

    if (this.passwordData.newPassword.length < 6) {
      this.error = 'La nueva contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.loading = true;
    this.error = '';

    if (this.usuario) {
      this.usuariosService.updatePassword(this.usuario.id, {
        current_password: this.passwordData.currentPassword,
        new_password: this.passwordData.newPassword
      }).subscribe({
        next: (response) => {
          if (response.success) {
            this.confirm.emit(response.data);
            this.onClose();
          } else {
            this.error = response.message;
          }
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error al cambiar contraseña';
          this.loading = false;
          console.error('Error:', error);
        }
      });
    }
  }

  private toggleUsuario(): void {
    if (this.usuario) {
      this.loading = true;
      this.error = '';

      this.usuariosService.toggleActive(this.usuario.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.confirm.emit(response.data);
            this.onClose();
          } else {
            this.error = response.message;
          }
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error al cambiar estado del usuario';
          this.loading = false;
          console.error('Error:', error);
        }
      });
    }
  }

  private deleteUsuario(): void {
    if (this.usuario) {
      this.loading = true;
      this.error = '';

      this.usuariosService.delete(this.usuario.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.confirm.emit(response.data);
            this.onClose();
          } else {
            this.error = response.message;
          }
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error al eliminar usuario';
          this.loading = false;
          console.error('Error:', error);
        }
      });
    }
  }

  private resetForm(): void {
    this.error = '';
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  getModalIcon(): string {
    switch (this.modalType) {
      case 'create': return 'fas fa-plus';
      case 'edit': return 'fas fa-edit';
      case 'delete': return 'fas fa-trash';
      case 'toggle': return this.usuario?.activo ? 'fas fa-pause' : 'fas fa-play';
      case 'password': return 'fas fa-key';
      default: return 'fas fa-info-circle';
    }
  }

  getConfirmButtonText(): string {
    switch (this.modalType) {
      case 'create': return 'Crear';
      case 'edit': return 'Actualizar';
      case 'delete': return 'Eliminar';
      case 'toggle': return this.usuario?.activo ? 'Desactivar' : 'Activar';
      case 'password': return 'Cambiar Contraseña';
      default: return 'Confirmar';
    }
  }

  getConfirmButtonClass(): string {
    const baseClass = 'w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed';
    
    switch (this.modalType) {
      case 'delete': return `${baseClass} bg-red-600 hover:bg-red-700 focus:ring-red-500`;
      case 'toggle': return this.usuario?.activo 
        ? `${baseClass} bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500`
        : `${baseClass} bg-green-600 hover:bg-green-700 focus:ring-green-500`;
      default: return `${baseClass} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`;
    }
  }
}
