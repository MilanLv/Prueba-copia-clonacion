import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ModulosService } from '../../../shared/services/modulos.service';
import { Modulo } from '../../../shared/models/modulo.model';

@Component({
  selector: 'app-modulos-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modulos-list.component.html',
  styleUrl: './modulos-list.component.css'
})
export class ModulosListComponent implements OnInit {
  modulos: Modulo[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  showInactive = false;

  constructor(
    private modulosService: ModulosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadModulos();
  }

  loadModulos(): void {
    this.loading = true;
    this.error = '';

    this.modulosService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.modulos = response.data;
        } else {
          this.error = response.message;
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar módulos';
        this.loading = false;
        console.error('Modulos Service Error:', error);
      }
    });
  }

  get filteredModulos(): Modulo[] {
    let filtered = this.modulos;

    // Filtrar por término de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(modulo =>
        modulo.nombre.toLowerCase().includes(term) ||
        modulo.descripcion.toLowerCase().includes(term)
      );
    }

    // Filtrar por estado activo/inactivo
    if (!this.showInactive) {
      filtered = filtered.filter(modulo => modulo.activo);
    }

    return filtered;
  }

  toggleActive(modulo: Modulo): void {
    this.modulosService.toggleActive(modulo.id).subscribe({
      next: (response) => {
        if (response.success) {
          modulo.activo = response.data.activo;
        } else {
          this.error = response.message;
        }
      },
      error: (error) => {
        this.error = 'Error al cambiar estado del módulo';
        console.error('Error:', error);
      }
    });
  }

  deleteModulo(modulo: Modulo): void {
    if (confirm(`¿Estás seguro de que quieres eliminar el módulo "${modulo.nombre}"?`)) {
      this.modulosService.delete(modulo.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadModulos(); // Recargar la lista
          } else {
            this.error = response.message;
          }
        },
        error: (error) => {
          this.error = 'Error al eliminar módulo';
          console.error('Error:', error);
        }
      });
    }
  }

  // Métodos de navegación
  goToNewModulo(): void {
    this.router.navigate(['/modulos/nuevo']);
  }

  goToEditModulo(modulo: Modulo): void {
    this.router.navigate(['/modulos/editar', modulo.id]);
  }

  goToDetailModulo(modulo: Modulo): void {
    this.router.navigate(['/modulos/detalle', modulo.id]);
  }
}
