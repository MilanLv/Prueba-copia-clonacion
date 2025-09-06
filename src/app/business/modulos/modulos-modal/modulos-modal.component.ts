import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModulosService } from '../../../shared/services/modulos.service';
import { Modulo } from '../../../shared/models/modulo.model';

export enum ModalType {
  TOGGLE = 'toggle',
  DELETE = 'delete'
}

@Component({
  selector: 'app-modulos-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modulos-modal.component.html',
  styleUrl: './modulos-modal.component.css'
})
export class ModulosModalComponent {
  @Input() isOpen = false;
  @Input() modulo: Modulo | null = null;
  @Input() type: ModalType = ModalType.TOGGLE;
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  loading = false;
  error = '';

  constructor(private modulosService: ModulosService) {}

  get modalTitle(): string {
    switch (this.type) {
      case ModalType.TOGGLE:
        return this.modulo?.activo ? 'Desactivar Módulo' : 'Activar Módulo';
      case ModalType.DELETE:
        return 'Eliminar Módulo';
      default:
        return 'Confirmar Acción';
    }
  }

  get modalMessage(): string {
    if (!this.modulo) return '';

    switch (this.type) {
      case ModalType.TOGGLE:
        return this.modulo.activo
          ? `¿Estás seguro de que quieres desactivar el módulo "${this.modulo.nombre}"? Los permisos asociados no estarán disponibles.`
          : `¿Estás seguro de que quieres activar el módulo "${this.modulo.nombre}"?`;
      case ModalType.DELETE:
        return `¿Estás seguro de que quieres eliminar el módulo "${this.modulo.nombre}"? Esta acción no se puede deshacer.`;
      default:
        return '¿Estás seguro de que quieres realizar esta acción?';
    }
  }

  get modalIcon(): string {
    switch (this.type) {
      case ModalType.TOGGLE:
        return this.modulo?.activo ? 'fas fa-pause' : 'fas fa-play';
      case ModalType.DELETE:
        return 'fas fa-trash';
      default:
        return 'fas fa-question-circle';
    }
  }

  get confirmButtonText(): string {
    switch (this.type) {
      case ModalType.TOGGLE:
        return this.modulo?.activo ? 'Desactivar' : 'Activar';
      case ModalType.DELETE:
        return 'Eliminar';
      default:
        return 'Confirmar';
    }
  }

  get confirmButtonClass(): string {
    switch (this.type) {
      case ModalType.TOGGLE:
        return this.modulo?.activo 
          ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
          : 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
      case ModalType.DELETE:
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      default:
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
    }
  }

  onConfirm(): void {
    if (!this.modulo) return;

    this.loading = true;
    this.error = '';

    switch (this.type) {
      case ModalType.TOGGLE:
        this.toggleModulo();
        break;
      case ModalType.DELETE:
        this.deleteModulo();
        break;
    }
  }

  private toggleModulo(): void {
    if (!this.modulo) return;

    this.modulosService.toggleActive(this.modulo.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.modulo!.activo = response.data.activo;
          this.confirm.emit();
          this.closeModal();
        } else {
          this.error = response.message;
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cambiar estado del módulo';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  private deleteModulo(): void {
    if (!this.modulo) return;

    this.modulosService.delete(this.modulo.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.confirm.emit();
          this.closeModal();
        } else {
          this.error = response.message;
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al eliminar módulo';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  closeModal(): void {
    this.loading = false;
    this.error = '';
    this.close.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}
