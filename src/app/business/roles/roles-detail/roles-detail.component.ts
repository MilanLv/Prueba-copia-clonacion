import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RolesService } from '../../../shared/services/roles.service';
import { Rol } from '../../../shared/models/rol.model';

@Component({
  selector: 'app-roles-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roles-detail.component.html',
  styleUrl: './roles-detail.component.css'
})
export class RolesDetailComponent implements OnInit {
  @Input() rolId: number = 0;
  
  rol: Rol | null = null;
  loading = false;
  error = '';

  constructor(
    private rolesService: RolesService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Obtener ID de la ruta o del input
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.rolId = +id;
    }
    
    if (this.rolId) {
      this.loadRol();
    }
  }

  loadRol(): void {
    this.loading = true;
    this.error = '';
    
    this.rolesService.getById(this.rolId).subscribe({
      next: (response) => {
        if (response.success) {
          this.rol = response.data;
        } else {
          this.error = response.message;
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar rol';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }
}
