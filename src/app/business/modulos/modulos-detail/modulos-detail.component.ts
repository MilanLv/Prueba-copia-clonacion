import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ModulosService } from '../../../shared/services/modulos.service';
import { Modulo } from '../../../shared/models/modulo.model';

@Component({
  selector: 'app-modulos-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modulos-detail.component.html',
  styleUrl: './modulos-detail.component.css'
})
export class ModulosDetailComponent implements OnInit {
  @Input() moduloId: number = 0;

  modulo: Modulo | null = null;
  loading = false;
  error = '';

  constructor(
    private modulosService: ModulosService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obtener ID de la ruta o del input
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.moduloId = +id;
    }

    if (this.moduloId) {
      this.loadModulo();
    }
  }

  loadModulo(): void {
    this.loading = true;
    this.error = '';

    this.modulosService.getById(this.moduloId).subscribe({
      next: (response) => {
        if (response.success) {
          this.modulo = response.data;
        } else {
          this.error = response.message;
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar módulo';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/modulos']);
  }

  goToEdit(): void {
    if (this.modulo) {
      this.router.navigate(['/modulos/editar', this.modulo.id]);
    }
  }
}
