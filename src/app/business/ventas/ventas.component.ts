import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { VentasService } from '../../shared/services/ventas.service';
import { ProductosService } from '../../shared/services/productos.service';
import { AuthService } from '../../shared/services/auth.service';
import { BarcodeScannerService, ScanResult } from '../../shared/services/barcode-scanner.service';
import { CartItemModalComponent, CartItemData } from '../../shared/components/cart-item-modal/cart-item-modal.component';
import { 
  CarritoVenta, 
  CarritoItemVenta, 
  ProductoVenta, 
  VentaCompletaCreate 
} from '../../shared/models/venta.model';
import { Producto } from '../../shared/models/producto.model';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CartItemModalComponent],
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css']
})
export class VentasComponent implements OnInit, OnDestroy {
  // ====================================================================
  // PROPIEDADES PARA PRODUCTOS
  // ====================================================================
  productos: ProductoVenta[] = [];
  productosFiltrados: ProductoVenta[] = [];
  terminoBusqueda: string = '';
  categoriaFiltro: string = '';
  estadoStockFiltro: string = '';
  cargandoProductos: boolean = false;

  // ====================================================================
  // PROPIEDADES PARA EL CARRITO
  // ====================================================================
  carrito: CarritoVenta = {
    items: [],
    total_items: 0,
    total_cantidad: 0,
    subtotal: 0,
    total_descuentos: 0,
    total: 0
  };

  // ====================================================================
  // PROPIEDADES PARA LA VENTA
  // ====================================================================
  procesandoVenta: boolean = false;
  mensajeExito: string = '';
  mensajeError: string = '';

  // ====================================================================
  // PROPIEDADES PARA EL MODAL
  // ====================================================================
  showCartModal = false;
  selectedCartItem: CartItemData | null = null;

  // ====================================================================
  // PROPIEDADES PARA EL ESCÁNER
  // ====================================================================
  scannerActivo = false;
  ultimoCodigoEscaneado = '';
  private scanSubscription: Subscription = new Subscription();

  constructor(
    private ventasService: VentasService,
    private productosService: ProductosService,
    private authService: AuthService,
    private barcodeScannerService: BarcodeScannerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
    this.inicializarEscaner();
  }

  ngOnDestroy(): void {
    this.scanSubscription.unsubscribe();
    this.barcodeScannerService.stopListening();
  }

  // ====================================================================
  // MÉTODOS PARA CARGAR PRODUCTOS
  // ====================================================================

  cargarProductos(): void {
    this.cargandoProductos = true;
    this.productosService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.productos = response.data.map((producto: Producto) => ({
            id: producto.id,
            cod: producto.cod,
            codigo_barras: producto.codigo_barras,
            descripcion: producto.descripcion,
            precio: producto.precio,
            cantidad: producto.cantidad,
            imagen: producto.imagen,
            estado_stock: this.obtenerEstadoStock(producto.cantidad)
          }));
          this.productosFiltrados = [...this.productos];
        }
        this.cargandoProductos = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.mensajeError = 'Error al cargar productos';
        this.cargandoProductos = false;
      }
    });
  }

  obtenerEstadoStock(cantidad: number): string {
    if (cantidad <= 0) return 'Sin Stock';
    if (cantidad <= 5) return 'Stock Bajo';
    return 'Stock Normal';
  }

  // ====================================================================
  // MÉTODOS DEL ESCÁNER DE CÓDIGOS DE BARRAS
  // ====================================================================

  inicializarEscaner(): void {
    // Suscribirse a los códigos escaneados
    this.scanSubscription = this.barcodeScannerService.onScan$.subscribe(
      (scanResult: ScanResult) => {
        this.procesarCodigoEscaneado(scanResult.code);
      }
    );

    // Suscribirse al estado del escáner
    this.barcodeScannerService.isListening$.subscribe(
      (isListening: boolean) => {
        this.scannerActivo = isListening;
      }
    );
  }

  activarEscaner(): void {
    this.barcodeScannerService.startListening();
    console.log('Escáner de códigos de barras activado para ventas');
  }

  desactivarEscaner(): void {
    this.barcodeScannerService.stopListening();
    console.log('Escáner de códigos de barras desactivado para ventas');
  }

  toggleEscaner(): void {
    if (this.scannerActivo) {
      this.desactivarEscaner();
    } else {
      this.activarEscaner();
    }
  }

  procesarCodigoEscaneado(codigo: string): void {
    if (!codigo || codigo.trim() === '') return;

    this.ultimoCodigoEscaneado = codigo;
    console.log('Código escaneado en ventas:', codigo);

    // Buscar el producto por código de barras
    this.buscarProductoPorCodigoVenta(codigo);
  }

  buscarProductoPorCodigoVenta(codigo: string): void {
    this.productosService.findByCode(codigo).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const producto: Producto = response.data;
          console.log('Producto encontrado para venta:', producto);
          
          // Convertir a ProductoVenta y agregar automáticamente al carrito
          const productoVenta: ProductoVenta = {
            id: producto.id,
            cod: producto.cod,
            codigo_barras: producto.codigo_barras,
            descripcion: producto.descripcion,
            precio: producto.precio,
            cantidad: producto.cantidad,
            imagen: producto.imagen,
            estado_stock: this.obtenerEstadoStock(producto.cantidad)
          };
          
          this.agregarAlCarrito(productoVenta);
          this.mostrarNotificacionProductoAgregadoVenta(productoVenta);
        } else {
          console.warn('No se encontró producto con código para venta:', codigo);
          this.mostrarNotificacionProductoNoEncontradoVenta(codigo);
        }
      },
      error: (error) => {
        console.error('Error al buscar producto por código en ventas:', error);
        this.mostrarNotificacionErrorVenta(codigo);
      }
    });
  }

  mostrarNotificacionProductoAgregadoVenta(producto: ProductoVenta): void {
    console.log(`✅ Producto agregado a venta: ${producto.descripcion}`);
    this.mensajeExito = `Producto agregado: ${producto.descripcion}`;
    
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => {
      this.mensajeExito = '';
    }, 3000);
    
    // Opcional: Agregar clase CSS temporal para resaltar el producto agregado
    setTimeout(() => {
      const productoEnCarrito = document.querySelector(`[data-producto-venta-id="${producto.id}"]`);
      if (productoEnCarrito) {
        productoEnCarrito.classList.add('producto-recien-agregado');
        setTimeout(() => {
          productoEnCarrito.classList.remove('producto-recien-agregado');
        }, 2000);
      }
    }, 100);
  }

  mostrarNotificacionProductoNoEncontradoVenta(codigo: string): void {
    console.warn(`❌ No se encontró producto con código para venta: ${codigo}`);
    this.mensajeError = `No se encontró producto con código: ${codigo}`;
    setTimeout(() => {
      this.mensajeError = '';
    }, 3000);
  }

  mostrarNotificacionErrorVenta(codigo: string): void {
    console.error(`❌ Error al buscar producto con código para venta: ${codigo}`);
    this.mensajeError = `Error al buscar producto con código: ${codigo}`;
    setTimeout(() => {
      this.mensajeError = '';
    }, 3000);
  }

  // Método para testing - simular escaneo manual en ventas
  simularEscaneoVenta(codigo: string): void {
    if (this.scannerActivo) {
      this.barcodeScannerService.simulateScan(codigo);
    } else {
      console.warn('El escáner no está activo para ventas');
    }
  }

  // ====================================================================
  // MÉTODOS DE FILTRADO Y BÚSQUEDA
  // ====================================================================

  filtrarProductos(): void {
    if (!this.productos || this.productos.length === 0) {
      this.productosFiltrados = [];
      return;
    }

    this.productosFiltrados = this.productos.filter(producto => {
      // Búsqueda por término (más robusta)
      const coincideTermino = this.buscarEnProducto(producto, this.terminoBusqueda);
      
      // Filtro por estado de stock
      const coincideEstado = !this.estadoStockFiltro || producto.estado_stock === this.estadoStockFiltro;
      
      return coincideTermino && coincideEstado;
    });
  }

  buscarEnProducto(producto: ProductoVenta, termino: string): boolean {
    if (!termino || termino.trim() === '') {
      return true;
    }

    const terminoNormalizado = this.normalizarTexto(termino);
    
    // Buscar en múltiples campos
    const campos = [
      producto.descripcion,
      producto.cod,
      producto.codigo_barras,
      producto.precio.toString(),
      producto.cantidad.toString()
    ];

    return campos.some(campo => 
      this.normalizarTexto(campo).includes(terminoNormalizado)
    );
  }

  normalizarTexto(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .trim();
  }

  onBusquedaChange(): void {
    // Búsqueda en tiempo real
    this.filtrarProductos();
  }

  limpiarFiltros(): void {
    this.terminoBusqueda = '';
    this.categoriaFiltro = '';
    this.estadoStockFiltro = '';
    this.filtrarProductos();
  }

  // Método para búsqueda con debounce (opcional)
  onBusquedaInput(): void {
    // Si quieres implementar debounce, puedes usar setTimeout aquí
    this.filtrarProductos();
  }

  // ====================================================================
  // MÉTODOS PARA EL CARRITO
  // ====================================================================

  agregarAlCarrito(producto: ProductoVenta): void {
    if (producto.cantidad <= 0) {
      this.mensajeError = 'No hay stock disponible para este producto';
      return;
    }

    const itemExistente = this.carrito.items.find(item => item.id_producto === producto.id);
    
    if (itemExistente) {
      if (itemExistente.cantidad >= producto.cantidad) {
        this.mensajeError = 'No hay suficiente stock disponible';
        return;
      }
      itemExistente.cantidad += 1;
    } else {
      const nuevoItem: CarritoItemVenta = {
        id_producto: producto.id,
        codigo: producto.cod,
        descripcion: producto.descripcion,
        precio_unitario: producto.precio,
        cantidad: 1,
        descuento: 0,
        subtotal: producto.precio,
        imagen: producto.imagen,
        stock_actual: producto.cantidad,
        estado_stock: producto.estado_stock
      };
      this.carrito.items.push(nuevoItem);
    }
    
    this.actualizarCarrito();
    this.mensajeError = '';
  }

  quitarDelCarrito(idProducto: number): void {
    this.carrito.items = this.carrito.items.filter(item => item.id_producto !== idProducto);
    this.actualizarCarrito();
  }

  actualizarCarrito(): void {
    this.carrito.total_items = this.carrito.items.length;
    this.carrito.total_cantidad = this.carrito.items.reduce((sum, item) => sum + item.cantidad, 0);
    this.carrito.subtotal = this.carrito.items.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);
    this.carrito.total_descuentos = this.carrito.items.reduce((sum, item) => sum + item.descuento, 0);
    this.carrito.total = this.carrito.subtotal - this.carrito.total_descuentos;
  }

  actualizarCantidad(idProducto: number, cantidad: number): void {
    const item = this.carrito.items.find(item => item.id_producto === idProducto);
    if (item) {
      if (cantidad <= 0) {
        this.quitarDelCarrito(idProducto);
        return;
      }
      
      const producto = this.productos.find(p => p.id === idProducto);
      if (producto && cantidad > producto.cantidad) {
        this.mensajeError = 'No hay suficiente stock disponible';
        return;
      }
      
      item.cantidad = cantidad;
      this.actualizarCarrito();
    }
  }

  actualizarDescuento(idProducto: number, descuento: number): void {
    const item = this.carrito.items.find(item => item.id_producto === idProducto);
    if (item) {
      item.descuento = descuento;
      this.actualizarCarrito();
    }
  }

  limpiarCarrito(): void {
    this.carrito = {
      items: [],
      total_items: 0,
      total_cantidad: 0,
      subtotal: 0,
      total_descuentos: 0,
      total: 0
    };
    this.mensajeError = '';
    this.mensajeExito = '';
  }

  // ====================================================================
  // MÉTODOS PARA PROCESAR VENTA
  // ====================================================================

  procesarVenta(): void {
    if (this.carrito.items.length === 0) {
      this.mensajeError = 'El carrito está vacío';
      return;
    }

    this.procesandoVenta = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    this.authService.getCurrentUser().subscribe({
      next: (usuario) => {
        if (!usuario) {
          this.mensajeError = 'Usuario no autenticado';
          this.procesandoVenta = false;
          return;
        }

        const ventaData: VentaCompletaCreate = {
          id_usuario: usuario.id,
          productos: this.carrito.items.map(item => ({
            id_producto: item.id_producto,
            cantidad: item.cantidad,
            descuento: item.descuento
          }))
        };

        this.ventasService.createComplete(ventaData).subscribe({
          next: (response) => {
            if (response.success) {
              this.mensajeExito = `Venta procesada exitosamente. Código: ${response.data.venta.cod}`;
              this.limpiarCarrito();
              this.cargarProductos(); // Actualizar stock
            } else {
              this.mensajeError = response.message || 'Error al procesar la venta';
            }
            this.procesandoVenta = false;
          },
          error: (error) => {
            console.error('Error al procesar venta:', error);
            this.mensajeError = error.error?.message || 'Error al procesar la venta';
            this.procesandoVenta = false;
          }
        });
      },
      error: (error) => {
        console.error('Error al obtener usuario:', error);
        this.mensajeError = 'Error al obtener información del usuario';
        this.procesandoVenta = false;
      }
    });
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

  // ====================================================================
  // MÉTODOS PARA MANEJAR EVENTOS DE INPUT
  // ====================================================================

  onCantidadChange(idProducto: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.actualizarCantidad(idProducto, +target.value);
  }

  onDescuentoChange(idProducto: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.actualizarDescuento(idProducto, +target.value);
  }

  trackByProductoId(index: number, item: CarritoItemVenta): number {
    return item.id_producto;
  }

  // ====================================================================
  // MÉTODOS DE NAVEGACIÓN
  // ====================================================================

  verListaVentas(): void {
    this.router.navigate(['/ventas/lista']);
  }

  // ====================================================================
  // MÉTODOS PARA EL MODAL DE EDICIÓN DE CARRITO
  // ====================================================================

  /**
   * Abre el modal para editar un item del carrito
   */
  openCartItemModal(item: CarritoItemVenta): void {
    this.selectedCartItem = {
      id_producto: item.id_producto,
      cod: item.codigo,
      descripcion: item.descripcion,
      precio_unitario: item.precio_unitario,
      cantidad: item.cantidad,
      descuento: item.descuento,
      stock_actual: item.stock_actual,
      imagen: item.imagen
    };
    this.showCartModal = true;
  }

  /**
   * Maneja el doble click en un item del carrito
   */
  onCartItemDoubleClick(item: CarritoItemVenta): void {
    this.openCartItemModal(item);
  }

  /**
   * Guarda los cambios del item editado
   */
  onSaveCartItem(updatedItem: CartItemData): void {
    const carritoItem = this.carrito.items.find(item => item.id_producto === updatedItem.id_producto);
    if (carritoItem) {
      carritoItem.cantidad = updatedItem.cantidad;
      carritoItem.descuento = updatedItem.descuento;
      carritoItem.subtotal = (updatedItem.cantidad * updatedItem.precio_unitario) - updatedItem.descuento;
      this.actualizarCarrito();
    }
  }

  /**
   * Elimina un item del carrito desde el modal
   */
  onDeleteCartItem(idProducto: number): void {
    this.quitarDelCarrito(idProducto);
  }

  /**
   * Convierte CarritoItemVenta a CartItemData
   */
  private convertToCartItemData(item: CarritoItemVenta): CartItemData {
    return {
      id_producto: item.id_producto,
      cod: item.codigo,
      descripcion: item.descripcion,
      precio_unitario: item.precio_unitario,
      cantidad: item.cantidad,
      descuento: item.descuento,
      stock_actual: item.stock_actual,
      imagen: item.imagen
    };
  }
}
