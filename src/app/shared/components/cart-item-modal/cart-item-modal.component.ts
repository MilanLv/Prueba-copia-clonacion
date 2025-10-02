import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CartItemData {
  id_producto: number;
  cod: string;
  descripcion: string;
  precio_unitario: number;
  cantidad: number;
  descuento: number;
  stock_actual: number;
  imagen?: string;
}

@Component({
  selector: 'app-cart-item-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart-item-modal.component.html',
  styleUrl: './cart-item-modal.component.css'
})
export class CartItemModalComponent {
  @Input() isOpen = false;
  @Input() item: CartItemData | null = null;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() saveChanges = new EventEmitter<CartItemData>();
  @Output() deleteItem = new EventEmitter<number>();

  // Datos del formulario
  cantidad: number = 1;
  descuento: number = 0;
  
  // Validaciones
  cantidadError = '';
  descuentoError = '';

  // Estados
  isDeleting = false;

  ngOnChanges(): void {
    if (this.item) {
      this.cantidad = this.item.cantidad;
      this.descuento = this.item.descuento;
      this.resetErrors();
    }
  }

  /**
   * Calcula el subtotal del item
   */
  get subtotal(): number {
    const subtotalBase = this.cantidad * (this.item?.precio_unitario || 0);
    return Math.max(0, subtotalBase - this.descuento);
  }

  /**
   * Calcula el descuento máximo permitido
   */
  get descuentoMaximo(): number {
    return this.cantidad * (this.item?.precio_unitario || 0);
  }

  /**
   * Valida la cantidad ingresada
   */
  validateCantidad(): boolean {
    if (!this.item) return false;
    
    this.cantidadError = '';
    
    if (this.cantidad <= 0) {
      this.cantidadError = 'La cantidad debe ser mayor a 0';
      return false;
    }
    
    if (this.cantidad > this.item.stock_actual) {
      this.cantidadError = `No hay suficiente stock. Disponible: ${this.item.stock_actual}`;
      return false;
    }
    
    return true;
  }

  /**
   * Valida el descuento ingresado
   */
  validateDescuento(): boolean {
    this.descuentoError = '';
    
    if (this.descuento < 0) {
      this.descuentoError = 'El descuento no puede ser negativo';
      return false;
    }
    
    if (this.descuento > this.descuentoMaximo) {
      this.descuentoError = `El descuento no puede ser mayor al subtotal (${this.descuentoMaximo.toFixed(2)})`;
      return false;
    }
    
    return true;
  }

  /**
   * Valida todo el formulario
   */
  validateForm(): boolean {
    const cantidadValid = this.validateCantidad();
    const descuentoValid = this.validateDescuento();
    
    return cantidadValid && descuentoValid;
  }

  /**
   * Resetea los errores de validación
   */
  resetErrors(): void {
    this.cantidadError = '';
    this.descuentoError = '';
  }

  /**
   * Maneja el cambio en la cantidad
   */
  onCantidadChange(): void {
    this.validateCantidad();
    // Si hay un descuento y la cantidad cambió, validar el descuento también
    if (this.descuento > 0) {
      this.validateDescuento();
    }
  }

  /**
   * Maneja el cambio en el descuento
   */
  onDescuentoChange(): void {
    this.validateDescuento();
  }

  /**
   * Guarda los cambios del item
   */
  saveItem(): void {
    if (!this.item || !this.validateForm()) {
      return;
    }

    const updatedItem: CartItemData = {
      ...this.item,
      cantidad: this.cantidad,
      descuento: this.descuento
    };

    this.saveChanges.emit(updatedItem);
    this.closeModal();
  }

  /**
   * Elimina el item del carrito
   */
  deleteItemFromCart(): void {
    if (!this.item) return;
    
    this.isDeleting = true;
    
    // Confirmar eliminación
    if (confirm(`¿Estás seguro de eliminar "${this.item.descripcion}" del carrito?`)) {
      this.deleteItem.emit(this.item.id_producto);
      this.closeModal();
    }
    
    this.isDeleting = false;
  }

  /**
   * Cierra el modal
   */
  closeModal(): void {
    this.isOpen = false;
    this.isOpenChange.emit(false);
    this.resetForm();
  }

  /**
   * Resetea el formulario
   */
  resetForm(): void {
    this.cantidad = 1;
    this.descuento = 0;
    this.resetErrors();
    this.isDeleting = false;
  }

  /**
   * Formatea un precio
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }


  /**
   * Disminuye la cantidad
   */
  decreaseQuantity(): void {
    if (this.cantidad > 1) {
      this.cantidad--;
      this.onCantidadChange();
    }
  }

  /**
   * Aumenta la cantidad
   */
  increaseQuantity(): void {
    if (this.item && this.cantidad < this.item.stock_actual) {
      this.cantidad++;
      this.onCantidadChange();
    }
  }
}
