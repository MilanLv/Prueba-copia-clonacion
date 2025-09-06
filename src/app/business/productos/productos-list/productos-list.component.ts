import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductosService } from '../../../shared/services/productos.service';
import { AuthService } from '../../../shared/services/auth.service';
import { Producto } from '../../../shared/models/producto.model';

@Component({
  selector: 'app-productos-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos-list.component.html',
  styleUrl: './productos-list.component.css'
})
export class ProductosListComponent implements OnInit {
  productos: Producto[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  selectedStockFilter = '';
  showWithoutBarcode = false;
  stats: any = null;

  // Filtros disponibles
  stockFilters = [
    { value: '', label: 'Todos' },
    { value: 'Sin Stock', label: 'Sin Stock' },
    { value: 'Stock Bajo', label: 'Stock Bajo' },
    { value: 'Stock Medio', label: 'Stock Medio' },
    { value: 'Stock Normal', label: 'Stock Normal' }
  ];

  constructor(
    private productosService: ProductosService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProductos();
    this.loadStats();
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

  loadProductos(): void {
    this.loading = true;
    this.error = '';
    
    this.productosService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.productos = response.data;
        } else {
          this.error = response.message;
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar productos';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  loadStats(): void {
    this.productosService.getStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }

  get filteredProductos(): Producto[] {
    let filtered = this.productos;

    // Filtrar por término de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(producto => 
        producto.descripcion.toLowerCase().includes(term) ||
        producto.cod?.toLowerCase().includes(term) ||
        producto.codigo_barras?.toLowerCase().includes(term)
      );
    }

    // Filtrar por estado de stock
    if (this.selectedStockFilter) {
      filtered = filtered.filter(producto => producto.estado_stock === this.selectedStockFilter);
    }

    // Filtrar productos sin código de barras
    if (this.showWithoutBarcode) {
      filtered = filtered.filter(producto => !producto.tiene_codigo_barras);
    }

    return filtered;
  }

  getStockBadgeClass(estado: string): string {
    switch (estado) {
      case 'Sin Stock':
        return 'bg-red-100 text-red-800';
      case 'Stock Bajo':
        return 'bg-yellow-100 text-yellow-800';
      case 'Stock Medio':
        return 'bg-blue-100 text-blue-800';
      case 'Stock Normal':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getImageUrl(producto: Producto): string {
    if (producto.imagen) {
      return this.productosService.getImage(producto.imagen);
    }
    return '/assets/images/no-image.png'; // Imagen por defecto
  }

  searchProductos(): void {
    if (this.searchTerm.trim()) {
      this.loading = true;
      this.productosService.search(this.searchTerm.trim()).subscribe({
        next: (response) => {
          if (response.success) {
            this.productos = response.data;
          } else {
            this.error = response.message;
          }
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error al buscar productos';
          this.loading = false;
          console.error('Error:', error);
        }
      });
    } else {
      this.loadProductos();
    }
  }

  loadLowStock(): void {
    this.loading = true;
    this.productosService.getLowStock(5).subscribe({
      next: (response) => {
        if (response.success) {
          this.productos = response.data;
          this.selectedStockFilter = 'Stock Bajo';
        } else {
          this.error = response.message;
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar productos con stock bajo';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  loadWithoutBarcode(): void {
    this.loading = true;
    this.productosService.getWithoutBarcode().subscribe({
      next: (response) => {
        if (response.success) {
          this.productos = response.data;
          this.showWithoutBarcode = true;
        } else {
          this.error = response.message;
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar productos sin código de barras';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  loadTopSelling(): void {
    this.loading = true;
    this.productosService.getTopSelling(10).subscribe({
      next: (response) => {
        if (response.success) {
          this.productos = response.data;
        } else {
          this.error = response.message;
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar productos más vendidos';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  deleteProducto(producto: Producto): void {
    if (confirm(`¿Estás seguro de eliminar el producto "${producto.descripcion}"?`)) {
      this.productosService.delete(producto.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.productos = this.productos.filter(p => p.id !== producto.id);
            this.loadStats(); // Recargar estadísticas
          } else {
            this.error = response.message;
          }
        },
        error: (error) => {
          this.error = 'Error al eliminar producto';
          console.error('Error:', error);
        }
      });
    }
  }

  generateBarcode(producto: Producto): void {
    this.productosService.generateBarcode(producto.id).subscribe({
      next: (response) => {
        if (response.success) {
          // Recargar el producto para obtener el nuevo código
          this.loadProductos();
        } else {
          this.error = response.message;
        }
      },
      error: (error) => {
        this.error = 'Error al generar código de barras';
        console.error('Error:', error);
      }
    });
  }

  generateBarcodesBatch(): void {
    if (confirm('¿Generar códigos de barras para todos los productos que no los tienen?')) {
      this.loading = true;
      this.productosService.generateBarcodesBatch().subscribe({
        next: (response) => {
          if (response.success) {
            alert(`Códigos generados: ${response.data.exitosos} exitosos, ${response.data.fallidos} fallidos`);
            this.loadProductos();
          } else {
            this.error = response.message;
          }
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error al generar códigos de barras masivamente';
          this.loading = false;
          console.error('Error:', error);
        }
      });
    }
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStockFilter = '';
    this.showWithoutBarcode = false;
    this.loadProductos();
  }

  // Métodos de navegación
  goToNewProducto(): void {
    this.router.navigate(['/productos/nuevo']);
  }

  goToEditProducto(producto: Producto): void {
    this.router.navigate(['/productos/editar', producto.id]);
  }

  goToDetailProducto(producto: Producto): void {
    this.router.navigate(['/productos/detalle', producto.id]);
  }
}
