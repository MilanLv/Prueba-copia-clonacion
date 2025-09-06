import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../../shared/services/productos.service';
import { Producto } from '../../../shared/models/producto.model';

@Component({
  selector: 'app-productos-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos-modal.component.html',
  styleUrl: './productos-modal.component.css'
})
export class ProductosModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() producto: Producto | null = null;
  @Input() mode: 'view' | 'edit' | 'delete' = 'view';
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<any>();

  loading = false;
  error = '';
  searchTerm = '';
  searchResults: Producto[] = [];
  showSearchResults = false;

  constructor(private productosService: ProductosService) {}

  ngOnInit(): void {
    if (this.mode === 'view' && this.producto) {
      this.loadProducto();
    }
  }

  loadProducto(): void {
    if (this.producto) {
      this.loading = true;
      this.productosService.getById(this.producto.id).subscribe({
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
  }

  searchProductos(): void {
    if (this.searchTerm.trim()) {
      this.loading = true;
      this.productosService.search(this.searchTerm.trim()).subscribe({
        next: (response) => {
          if (response.success) {
            this.searchResults = response.data;
            this.showSearchResults = true;
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
      this.searchResults = [];
      this.showSearchResults = false;
    }
  }

  selectProducto(producto: Producto): void {
    this.producto = producto;
    this.showSearchResults = false;
    this.searchTerm = '';
  }

  getImageUrl(producto: Producto): string {
    if (producto.imagen) {
      return this.productosService.getImage(producto.imagen);
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

  onClose(): void {
    this.close.emit();
  }

  onConfirm(): void {
    this.confirm.emit(this.producto);
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
