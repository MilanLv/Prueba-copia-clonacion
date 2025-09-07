// ====================================================================
// COMPONENTE DE LISTA DE COTIZACIONES
// ====================================================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CotizacionesService } from '../../../shared/services/cotizaciones.service';
import { Cotizacion, CotizacionStats } from '../../../shared/models/cotizacion.model';

@Component({
  selector: 'app-cotizaciones-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cotizaciones-list.component.html',
  styleUrl: './cotizaciones-list.component.css'
})
export class CotizacionesListComponent implements OnInit {
  // ====================================================================
  // PROPIEDADES
  // ====================================================================
  
  cotizaciones: Cotizacion[] = [];
  cotizacionesFiltradas: Cotizacion[] = [];
  estadisticas: CotizacionStats | null = null;
  
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
    private cotizacionesService: CotizacionesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarCotizaciones();
    this.cargarEstadisticas();
  }

  // ====================================================================
  // MÉTODOS DE CARGA DE DATOS
  // ====================================================================

  cargarCotizaciones(): void {
    this.cargando = true;
    this.cotizacionesService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.cotizaciones = response.data;
          this.aplicarFiltros();
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar cotizaciones:', error);
        this.cargando = false;
      }
    });
  }

  cargarEstadisticas(): void {
    this.cargandoEstadisticas = true;
    this.cotizacionesService.getStats().subscribe({
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
    let cotizaciones = [...this.cotizaciones];

    // Filtro por texto
    if (this.filtroTexto.trim()) {
      const texto = this.filtroTexto.toLowerCase();
      cotizaciones = cotizaciones.filter(c => 
        c.cod.toLowerCase().includes(texto) ||
        (c.vendedor && c.vendedor.toLowerCase().includes(texto))
      );
    }

    // Filtro por rango de fechas
    if (this.filtroFechaInicio) {
      cotizaciones = cotizaciones.filter(c => 
        new Date(c.fecha) >= new Date(this.filtroFechaInicio)
      );
    }

    if (this.filtroFechaFin) {
      cotizaciones = cotizaciones.filter(c => 
        new Date(c.fecha) <= new Date(this.filtroFechaFin)
      );
    }

    // Aplicar ordenamiento
    cotizaciones.sort((a, b) => {
      let valorA: any = a[this.campoOrdenamiento as keyof Cotizacion];
      let valorB: any = b[this.campoOrdenamiento as keyof Cotizacion];

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

    this.cotizacionesFiltradas = cotizaciones;
    this.totalItems = cotizaciones.length;
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
    this.router.navigate(['/cotizaciones/detalle', id]);
  }

  editarCotizacion(id: number): void {
    this.router.navigate(['/cotizaciones/editar', id]);
  }

  crearNuevaCotizacion(): void {
    this.router.navigate(['/cotizaciones']);
  }

  // ====================================================================
  // MÉTODOS DE ACCIONES
  // ====================================================================

  eliminarCotizacion(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta cotización?')) {
      this.cotizacionesService.delete(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.cargarCotizaciones();
          }
        },
        error: (error) => {
          console.error('Error al eliminar cotización:', error);
        }
      });
    }
  }

  convertirAVenta(id: number): void {
    if (confirm('¿Convertir esta cotización en una venta?')) {
      this.cotizacionesService.convertToSale(id).subscribe({
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

  // ====================================================================
  // MÉTODOS DE PAGINACIÓN
  // ====================================================================

  get cotizacionesPaginadas(): Cotizacion[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.cotizacionesFiltradas.slice(inicio, fin);
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
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(precio);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  obtenerEstadoCotizacion(cotizacion: Cotizacion): string {
    // Aquí puedes implementar lógica para determinar el estado
    // Por ejemplo, basado en la fecha, total, etc.
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

  // ====================================================================
  // MÉTODOS DE UTILIDAD PARA TEMPLATE
  // ====================================================================

  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }
}
