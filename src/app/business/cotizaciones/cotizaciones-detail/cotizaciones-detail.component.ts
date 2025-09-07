// ====================================================================
// COMPONENTE DE DETALLE DE COTIZACIÓN
// ====================================================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CotizacionesService } from '../../../shared/services/cotizaciones.service';
import { CotizacionCompleta, DetalleCotizacion } from '../../../shared/models/cotizacion.model';

@Component({
  selector: 'app-cotizaciones-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cotizaciones-detail.component.html',
  styleUrl: './cotizaciones-detail.component.css'
})
export class CotizacionesDetailComponent implements OnInit {
  // ====================================================================
  // PROPIEDADES
  // ====================================================================
  
  cotizacionCompleta: CotizacionCompleta | null = null;
  cargando = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cotizacionesService: CotizacionesService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarCotizacion(parseInt(id));
    }
  }

  // ====================================================================
  // MÉTODOS DE CARGA DE DATOS
  // ====================================================================

  cargarCotizacion(id: number): void {
    this.cargando = true;
    this.error = '';
    
    this.cotizacionesService.getWithDetails(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.cotizacionCompleta = response.data;
        } else {
          this.error = 'No se pudo cargar la cotización';
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar cotización:', error);
        this.error = 'Error al cargar la cotización';
        this.cargando = false;
      }
    });
  }

  // ====================================================================
  // MÉTODOS DE NAVEGACIÓN
  // ====================================================================

  volverALista(): void {
    this.router.navigate(['/cotizaciones/lista']);
  }

  editarCotizacion(): void {
    if (this.cotizacionCompleta) {
      this.router.navigate(['/cotizaciones/editar', this.cotizacionCompleta.cotizacion.id]);
    }
  }

  // ====================================================================
  // MÉTODOS DE ACCIONES
  // ====================================================================

  convertirAVenta(): void {
    if (this.cotizacionCompleta && confirm('¿Convertir esta cotización en una venta?')) {
      this.cotizacionesService.convertToSale(this.cotizacionCompleta.cotizacion.id).subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Cotización convertida a venta:', response.data);
            // Opcional: mostrar mensaje de éxito o redirigir
          }
        },
        error: (error) => {
          console.error('Error al convertir cotización:', error);
        }
      });
    }
  }

  eliminarCotizacion(): void {
    if (this.cotizacionCompleta && confirm('¿Estás seguro de que quieres eliminar esta cotización?')) {
      this.cotizacionesService.delete(this.cotizacionCompleta.cotizacion.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.volverALista();
          }
        },
        error: (error) => {
          console.error('Error al eliminar cotización:', error);
        }
      });
    }
  }

  // ====================================================================
  // MÉTODOS DE UTILIDAD
  // ====================================================================

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(precio);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  obtenerEstadoCotizacion(): string {
    // Aquí puedes implementar lógica para determinar el estado
    return 'Activa';
  }

  obtenerColorEstado(estado: string): string {
    switch (estado) {
      case 'Activa':
        return 'text-green-600 bg-green-100';
      case 'Convertida':
        return 'text-blue-600 bg-blue-100';
      case 'Cancelada':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  calcularSubtotal(detalle: DetalleCotizacion): number {
    return (detalle.cantidad * detalle.precio_unitario) - detalle.descuento;
  }
}
