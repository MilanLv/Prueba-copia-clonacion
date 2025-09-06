import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductosService } from '../../../shared/services/productos.service';
import { AuthService } from '../../../shared/services/auth.service';
import { Producto } from '../../../shared/models/producto.model';
import { BarcodeDisplayComponent } from '../../../shared/components/barcode-display/barcode-display.component';

@Component({
  selector: 'app-productos-detail',
  standalone: true,
  imports: [CommonModule, BarcodeDisplayComponent],
  templateUrl: './productos-detail.component.html',
  styleUrl: './productos-detail.component.css'
})
export class ProductosDetailComponent implements OnInit {
  producto: Producto | null = null;
  loading = false;
  error = '';

  constructor(
    private productosService: ProductosService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.checkUserRole();
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadProducto(id);
      }
    });
  }

  checkUserRole(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        if (user.rol_nombre?.toLowerCase() !== 'administrador') {
          this.error = 'No tienes permisos para acceder a esta sección. Se requiere rol de Administrador.';
        }
      }
    });
  }

  loadProducto(id: number): void {
    this.loading = true;
    this.productosService.getById(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.producto = response.data;
        } else {
          this.error = response.message;
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar producto';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  getImageUrl(): string {
    if (this.producto?.imagen) {
      return this.productosService.getImage(this.producto.imagen);
    }
    return '/assets/images/no-image.png';
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

  generateBarcode(): void {
    if (this.producto) {
      this.productosService.generateBarcode(this.producto.id).subscribe({
        next: (response) => {
          if (response.success) {
            // Recargar el producto para obtener el nuevo código
            this.loadProducto(this.producto!.id);
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
  }

  goToEdit(): void {
    if (this.producto) {
      this.router.navigate(['/productos/editar', this.producto.id]);
    }
  }

  goBack(): void {
    this.router.navigate(['/productos']);
  }
}
