import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { VentasService } from '../../../shared/services/ventas.service';
import { VentaCompleta, Venta, DetalleVenta } from '../../../shared/models/venta.model';

@Component({
  selector: 'app-ventas-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ventas-detail.component.html',
  styleUrls: ['./ventas-detail.component.css']
})
export class VentasDetailComponent implements OnInit {
  // ====================================================================
  // PROPIEDADES PARA DATOS
  // ====================================================================
  venta: Venta | null = null;
  detalles: DetalleVenta[] = [];
  cargando: boolean = false;

  // ====================================================================
  // PROPIEDADES PARA MENSAJES
  // ====================================================================
  mensajeError: string = '';
  mensajeExito: string = '';

  // ====================================================================
  // PROPIEDADES PARA ESTADÍSTICAS
  // ====================================================================
  totalItems: number = 0;
  totalCantidad: number = 0;
  subtotal: number = 0;
  totalDescuentos: number = 0;
  total: number = 0;

  constructor(
    private ventasService: VentasService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.cargarVentaCompleta(id);
      }
    });
  }

  // ====================================================================
  // MÉTODOS PARA CARGAR DATOS
  // ====================================================================

  cargarVentaCompleta(id: number): void {
    this.cargando = true;
    this.mensajeError = '';

    this.ventasService.getWithDetails(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.venta = response.data.venta;
          this.detalles = response.data.detalles;
          this.calcularTotales();
        } else {
          this.mensajeError = response.message || 'Error al cargar la venta';
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar venta:', error);
        this.mensajeError = 'Error al cargar la venta';
        this.cargando = false;
      }
    });
  }

  // ====================================================================
  // MÉTODOS DE CÁLCULO
  // ====================================================================

  calcularTotales(): void {
    if (!this.detalles) {
      this.totalItems = 0;
      this.totalCantidad = 0;
      this.subtotal = 0;
      this.totalDescuentos = 0;
      this.total = 0;
      return;
    }

    this.totalItems = this.detalles.length;
    this.totalCantidad = this.detalles.reduce((sum, detalle) => sum + detalle.cantidad, 0);
    this.subtotal = this.detalles.reduce((sum, detalle) => sum + (detalle.precio_actual_producto! * detalle.cantidad), 0);
    this.totalDescuentos = this.detalles.reduce((sum, detalle) => sum + detalle.descuento, 0);
    this.total = this.subtotal - this.totalDescuentos;
  }

  // ====================================================================
  // MÉTODOS DE ACCIONES
  // ====================================================================

  eliminarVenta(): void {
    if (!this.venta) return;

    if (!confirm(`¿Estás seguro de que quieres eliminar la venta ${this.venta.cod}?`)) {
      return;
    }

    this.ventasService.delete(this.venta.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.mensajeExito = 'Venta eliminada correctamente';
          setTimeout(() => {
            this.router.navigate(['/ventas/lista']);
          }, 2000);
        } else {
          this.mensajeError = response.message || 'Error al eliminar venta';
        }
      },
      error: (error) => {
        console.error('Error al eliminar venta:', error);
        this.mensajeError = 'Error al eliminar venta';
      }
    });
  }

  imprimirVenta(): void {
    window.print();
  }

  exportarVenta(): void {
    // TODO: Implementar exportación de venta individual
    this.mensajeExito = 'Funcionalidad de exportación en desarrollo';
  }

  // ====================================================================
  // MÉTODOS DE UTILIDAD
  // ====================================================================

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(precio);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatearFechaCorta(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  obtenerClaseEstadoStock(estado: string): string {
    switch (estado) {
      case 'Sin Stock': return 'text-red-600 bg-red-100';
      case 'Stock Bajo': return 'text-yellow-600 bg-yellow-100';
      case 'Stock Normal': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  volverAtras(): void {
    this.router.navigate(['/ventas/lista']);
  }
}
