import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PermisosService } from '../../../shared/services/permisos.service';
import { Permiso } from '../../../shared/models/permiso.model';

@Component({
  selector: 'app-permisos-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './permisos-detail.component.html',
  styleUrl: './permisos-detail.component.css'
})
export class PermisosDetailComponent implements OnInit {
  permiso: Permiso | null = null;
  loading = false;
  error = '';

  constructor(
    private permisosService: PermisosService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPermiso(parseInt(id));
    }
  }

  loadPermiso(id: number): void {
    this.loading = true;
    this.error = '';

    this.permisosService.getById(id).subscribe({
      next: (data) => {
        this.permiso = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  goToEdit(): void {
    if (this.permiso) {
      this.router.navigate(['/permisos/editar', this.permiso.id]);
    }
  }

  goBack(): void {
    this.router.navigate(['/permisos']);
  }

  deletePermiso(): void {
    if (this.permiso && confirm('¿Estás seguro de que quieres eliminar este permiso?')) {
      this.loading = true;
      this.permisosService.delete(this.permiso.id).subscribe({
        next: () => {
          this.router.navigate(['/permisos']);
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
    }
  }

  getPermisoIcon(permiso: string): string {
    switch (permiso) {
      case 'crear': return 'fas fa-plus';
      case 'leer': return 'fas fa-eye';
      case 'actualizar': return 'fas fa-edit';
      case 'eliminar': return 'fas fa-trash';
      default: return 'fas fa-question';
    }
  }

  getPermisoColor(permiso: string, tienePermiso: boolean): string {
    if (!tienePermiso) return 'text-gray-400';
    
    switch (permiso) {
      case 'crear': return 'text-green-600';
      case 'leer': return 'text-blue-600';
      case 'actualizar': return 'text-yellow-600';
      case 'eliminar': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }
}
