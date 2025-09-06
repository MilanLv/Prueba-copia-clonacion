import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UsuariosService } from '../../../shared/services/usuarios.service';
import { Usuario } from '../../../shared/models/usuario.model';

@Component({
  selector: 'app-usuarios-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios-detail.component.html',
  styleUrl: './usuarios-detail.component.css'
})
export class UsuariosDetailComponent implements OnInit {
  @Input() usuarioId: number = 0;
  
  usuario: Usuario | null = null;
  loading = false;
  error = '';

  constructor(
    private usuariosService: UsuariosService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Obtener ID de la ruta o del input
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.usuarioId = +id;
    }
    
    if (this.usuarioId) {
      this.loadUsuario();
    }
  }

  loadUsuario(): void {
    this.loading = true;
    this.error = '';
    
    this.usuariosService.getById(this.usuarioId).subscribe({
      next: (response) => {
        if (response.success) {
          this.usuario = response.data;
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

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleString('es-ES');
  }
}
