import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolesService } from '../../../shared/services/roles.service';
import { Rol } from '../../../shared/models/rol.model';

export type ModalType = 'create' | 'edit' | 'delete' | 'toggle';

@Component({
  selector: 'app-roles-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roles-modal.component.html',
  styleUrl: './roles-modal.component.css'
})
export class RolesModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() modalType: ModalType = 'create';
  @Input() rol: Rol | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<any>();

  loading = false;
  error = '';

  constructor(private rolesService: RolesService) {}

  ngOnInit(): void {
    if (this.isOpen) {
      this.resetForm();
    }
  }

  get modalTitle(): string {
    switch (this.modalType) {
      case 'create': return 'Nuevo Rol';
      case 'edit': return 'Editar Rol';
      case 'delete': return 'Eliminar Rol';
      case 'toggle': return this.rol?.activo ? 'Desactivar Rol' : 'Activar Rol';
      default: return 'Modal';
    }
  }

  get modalMessage(): string {
    switch (this.modalType) {
      case 'delete': 
        return `¿Estás seguro de que deseas eliminar el rol "${this.rol?.nombre}"? Esta acción no se puede deshacer.`;
      case 'toggle': 
        return `¿Estás seguro de que deseas ${this.rol?.activo ? 'desactivar' : 'activar'} el rol "${this.rol?.nombre}"?`;
      default: return '';
    }
  }

  onClose(): void {
    this.close.emit();
    this.resetForm();
  }

  onConfirm(): void {
    if (this.modalType === 'toggle') {
      this.toggleRol();
    } else if (this.modalType === 'delete') {
      this.deleteRol();
    } else {
      this.confirm.emit();
    }
  }

  private toggleRol(): void {
    if (this.rol) {
      this.loading = true;
      this.error = '';

      this.rolesService.toggleActive(this.rol.id).subscribe({
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
          this.error = 'Error al cambiar estado del rol';
          this.loading = false;
          console.error('Error:', error);
        }
      });
    }
  }

  private deleteRol(): void {
    if (this.rol) {
      this.loading = true;
      this.error = '';

      this.rolesService.delete(this.rol.id).subscribe({
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
          this.error = 'Error al eliminar rol';
          this.loading = false;
          console.error('Error:', error);
        }
      });
    }
  }

  private resetForm(): void {
    this.error = '';
  }

  getModalIcon(): string {
    switch (this.modalType) {
      case 'create': return 'fas fa-plus';
      case 'edit': return 'fas fa-edit';
      case 'delete': return 'fas fa-trash';
      case 'toggle': return this.rol?.activo ? 'fas fa-pause' : 'fas fa-play';
      default: return 'fas fa-info-circle';
    }
  }

  getConfirmButtonText(): string {
    switch (this.modalType) {
      case 'create': return 'Crear';
      case 'edit': return 'Actualizar';
      case 'delete': return 'Eliminar';
      case 'toggle': return this.rol?.activo ? 'Desactivar' : 'Activar';
      default: return 'Confirmar';
    }
  }

  getConfirmButtonClass(): string {
    const baseClass = 'w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed';
    
    switch (this.modalType) {
      case 'delete': return `${baseClass} bg-red-600 hover:bg-red-700 focus:ring-red-500`;
      case 'toggle': return this.rol?.activo 
        ? `${baseClass} bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500`
        : `${baseClass} bg-green-600 hover:bg-green-700 focus:ring-green-500`;
      default: return `${baseClass} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`;
    }
  }
}
