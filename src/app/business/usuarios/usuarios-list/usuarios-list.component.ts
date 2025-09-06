import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuariosService } from '../../../shared/services/usuarios.service';
import { RolesService } from '../../../shared/services/roles.service';
import { AuthService } from '../../../shared/services/auth.service';
import { Usuario } from '../../../shared/models/usuario.model';
import { Rol } from '../../../shared/models/rol.model';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios-list.component.html',
  styleUrl: './usuarios-list.component.css'
})
export class UsuariosListComponent implements OnInit {
  usuarios: Usuario[] = [];
  roles: Rol[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  selectedRol = '';
  showInactive = false;

  constructor(
    private usuariosService: UsuariosService,
    private rolesService: RolesService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsuarios();
    this.loadRoles();
    this.checkUserRole();
  }

  checkUserRole(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        console.log('Usuario actual:', user);
        console.log('Rol del usuario:', user.rol_nombre);
        if (user.rol_nombre?.toLowerCase() !== 'administrador') {
          this.error = 'No tienes permisos para acceder a esta sección. Se requiere rol de Administrador.';
        }
      }
    });
  }

  loadUsuarios(): void {
    this.loading = true;
    this.error = '';
    
    this.usuariosService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.usuarios = response.data;
        } else {
          this.error = response.message;
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar usuarios';
        this.loading = false;
        console.error('Error:', error);
      }
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

  get filteredUsuarios(): Usuario[] {
    let filtered = this.usuarios;

    // Filtrar por término de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(usuario => 
        usuario.nombre_completo.toLowerCase().includes(term) ||
        usuario.ci.toLowerCase().includes(term) ||
        usuario.correo.toLowerCase().includes(term)
      );
    }

    // Filtrar por rol
    if (this.selectedRol) {
      filtered = filtered.filter(usuario => usuario.id_rol.toString() === this.selectedRol);
    }

    // Filtrar por estado activo/inactivo
    if (!this.showInactive) {
      filtered = filtered.filter(usuario => usuario.activo);
    }

    return filtered;
  }

  toggleUsuario(usuario: Usuario): void {
    this.usuariosService.toggleActive(usuario.id).subscribe({
      next: (response) => {
        if (response.success) {
          usuario.activo = response.data.activo;
        } else {
          this.error = response.message;
        }
      },
      error: (error) => {
        this.error = 'Error al cambiar estado del usuario';
        console.error('Error:', error);
      }
    });
  }

  deleteUsuario(usuario: Usuario): void {
    if (confirm(`¿Estás seguro de eliminar al usuario ${usuario.nombre_completo}?`)) {
      this.usuariosService.delete(usuario.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.usuarios = this.usuarios.filter(u => u.id !== usuario.id);
          } else {
            this.error = response.message;
          }
        },
        error: (error) => {
          this.error = 'Error al eliminar usuario';
          console.error('Error:', error);
        }
      });
    }
  }

  getRolNombre(idRol: number): string {
    const rol = this.roles.find(r => r.id === idRol);
    return rol ? rol.nombre : 'Sin rol';
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRol = '';
    this.showInactive = false;
  }

  // Métodos de navegación
  goToNewUsuario(): void {
    this.router.navigate(['/usuarios/nuevo']);
  }

  goToEditUsuario(usuario: Usuario): void {
    this.router.navigate(['/usuarios/editar', usuario.id]);
  }

  goToDetailUsuario(usuario: Usuario): void {
    this.router.navigate(['/usuarios/detalle', usuario.id]);
  }
}
