import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RolesService } from '../../../shared/services/roles.service';
import { Rol } from '../../../shared/models/rol.model';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles-list.component.html',
  styleUrl: './roles-list.component.css'
})
export class RolesListComponent implements OnInit {
  roles: Rol[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  showInactive = false;

  constructor(private rolesService: RolesService) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.error = '';
    
    this.rolesService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.roles = response.data;
        } else {
          this.error = response.message;
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar roles';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  get filteredRoles(): Rol[] {
    let filtered = this.roles;

    // Filtrar por término de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(rol => 
        rol.nombre.toLowerCase().includes(term) ||
        (rol.descripcion && rol.descripcion.toLowerCase().includes(term))
      );
    }

    // Filtrar por estado activo/inactivo
    if (!this.showInactive) {
      filtered = filtered.filter(rol => rol.activo);
    }

    return filtered;
  }

  toggleRol(rol: Rol): void {
    this.rolesService.toggleActive(rol.id).subscribe({
      next: (response) => {
        if (response.success) {
          rol.activo = response.data.activo;
        } else {
          this.error = response.message;
        }
      },
      error: (error) => {
        this.error = 'Error al cambiar estado del rol';
        console.error('Error:', error);
      }
    });
  }

  deleteRol(rol: Rol): void {
    if (confirm(`¿Estás seguro de eliminar el rol ${rol.nombre}?`)) {
      this.rolesService.delete(rol.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.roles = this.roles.filter(r => r.id !== rol.id);
          } else {
            this.error = response.message;
          }
        },
        error: (error) => {
          this.error = 'Error al eliminar rol';
          console.error('Error:', error);
        }
      });
    }
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.showInactive = false;
  }
}
