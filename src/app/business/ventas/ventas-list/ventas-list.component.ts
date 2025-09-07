// ====================================================================
// COMPONENTE DE LISTA DE VENTAS
// ====================================================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VentasService } from '../../../shared/services/ventas.service';
import { Venta, VentaStats } from '../../../shared/models/venta.model';

@Component({
  selector: 'app-ventas-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas-list.component.html',
  styleUrl: './ventas-list.component.css'
})
export class VentasListComponent implements OnInit {
  // ====================================================================
  // PROPIEDADES
  // ====================================================================
  
  ventas: Venta[] = [];
  ventasFiltradas: Venta[] = [];
  estadisticas: VentaStats | null = null;
  
  // Estados de carga
  cargando = false;
  cargandoEstadisticas = false;
  
  // Filtros
  filtroTexto = '';
  filtroFechaInicio = '';
  filtroFechaFin = '';
  filtroUsuario = '';
  
  // Paginación
  paginaActual = 1;
  itemsPorPagina = 10;
  totalItems = 0;
  
  // Ordenamiento
  campoOrdenamiento = 'fecha';
  direccionOrdenamiento: 'asc' | 'desc' = 'desc';

  constructor(
    private ventasService: VentasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarVentas();
    this.cargarEstadisticas();
  }

  // ====================================================================
  // MÉTODOS DE CARGA DE DATOS
  // ====================================================================

  cargarVentas(): void {
    this.cargando = true;
    this.ventasService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.ventas = response.data;
          this.aplicarFiltros();
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar ventas:', error);
        this.cargando = false;
      }
    });
  }

  cargarEstadisticas(): void {
    this.cargandoEstadisticas = true;
    this.ventasService.getStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.estadisticas = response.data;
        }
        this.cargandoEstadisticas = false;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
        this.cargandoEstadisticas = false;
      }
    });
  }

  // ====================================================================
  // MÉTODOS DE FILTRADO Y BÚSQUEDA
  // ====================================================================

  aplicarFiltros(): void {
    let ventas = [...this.ventas];

    // Filtro por texto
    if (this.filtroTexto.trim()) {
      const texto = this.filtroTexto.toLowerCase();
      ventas = ventas.filter(v => 
        v.cod.toLowerCase().includes(texto) ||
        (v.vendedor && v.vendedor.toLowerCase().includes(texto))
      );
    }

    // Filtro por rango de fechas
    if (this.filtroFechaInicio) {
      ventas = ventas.filter(v => 
        new Date(v.fecha) >= new Date(this.filtroFechaInicio)
      );
    }

    if (this.filtroFechaFin) {
      ventas = ventas.filter(v => 
        new Date(v.fecha) <= new Date(this.filtroFechaFin)
      );
    }

    // Aplicar ordenamiento
    ventas.sort((a, b) => {
      let valorA: any = a[this.campoOrdenamiento as keyof Venta];
      let valorB: any = b[this.campoOrdenamiento as keyof Venta];

      if (this.campoOrdenamiento === 'fecha') {
        valorA = new Date(valorA);
        valorB = new Date(valorB);
      }

      if (this.direccionOrdenamiento === 'asc') {
        return valorA > valorB ? 1 : -1;
      } else {
        return valorA < valorB ? 1 : -1;
      }
    });

    this.ventasFiltradas = ventas;
    this.totalItems = ventas.length;
    this.paginaActual = 1;
  }

  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.filtroUsuario = '';
    this.aplicarFiltros();
  }

  // ====================================================================
  // MÉTODOS DE ORDENAMIENTO
  // ====================================================================

  ordenarPor(campo: string): void {
    if (this.campoOrdenamiento === campo) {
      this.direccionOrdenamiento = this.direccionOrdenamiento === 'asc' ? 'desc' : 'asc';
    } else {
      this.campoOrdenamiento = campo;
      this.direccionOrdenamiento = 'asc';
    }
    this.aplicarFiltros();
  }

  // ====================================================================
  // MÉTODOS DE NAVEGACIÓN
  // ====================================================================

  verDetalle(id: number): void {
    this.router.navigate(['/ventas/detalle', id]);
  }

  crearNuevaVenta(): void {
    this.router.navigate(['/ventas']);
  }

  // ====================================================================
  // MÉTODOS DE ACCIONES
  // ====================================================================

  eliminarVenta(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta venta?')) {
      this.ventasService.delete(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.cargarVentas();
          }
        },
        error: (error) => {
          console.error('Error al eliminar venta:', error);
        }
      });
    }
  }

  imprimirVenta(id: number): void {
    // Implementar funcionalidad de impresión
    console.log('Imprimir venta:', id);
    // Aquí puedes implementar la lógica de impresión
  }

  // ====================================================================
  // MÉTODOS DE PAGINACIÓN
  // ====================================================================

  get ventasPaginadas(): Venta[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.ventasFiltradas.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.totalItems / this.itemsPorPagina);
  }

  cambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  obtenerEstadoVenta(venta: Venta): string {
    // Aquí puedes implementar lógica para determinar el estado
    // Por ejemplo, basado en la fecha, total, etc.
    return 'Completada';
  }

  obtenerColorEstado(estado: string): string {
    switch (estado) {
      case 'Completada':
        return 'text-green-600 bg-green-100';
      case 'Pendiente':
        return 'text-yellow-600 bg-yellow-100';
      case 'Cancelada':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  // ====================================================================
  // MÉTODOS DE UTILIDAD PARA TEMPLATE
  // ====================================================================

  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }
}