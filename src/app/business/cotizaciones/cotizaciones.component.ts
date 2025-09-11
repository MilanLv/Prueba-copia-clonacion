import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductosService } from '../../shared/services/productos.service';
import { CotizacionesService } from '../../shared/services/cotizaciones.service';
import { AuthService } from '../../shared/services/auth.service';
import { BarcodeScannerService, ScanResult } from '../../shared/services/barcode-scanner.service';
import { BarcodeScannerTestComponent } from '../../shared/components/barcode-scanner-test.component';
import { Producto } from '../../shared/models/producto.model';
import { CarritoItem, CarritoCotizacion } from '../../shared/models/cotizacion.model';

@Component({
  selector: 'app-cotizaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, BarcodeScannerTestComponent],
  templateUrl: './cotizaciones.component.html',
  styleUrl: './cotizaciones.component.css'
})
export class CotizacionesComponent implements OnInit, OnDestroy {
  // ====================================================================
  // PROPIEDADES
  // ====================================================================
  
  // Productos
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  productosCargando = false;
  
  // Filtros de productos
  filtroTexto = '';
  filtroCategoria = '';
  filtroStock = 'todos';
  
  // Carrito de cotización
  carrito: CarritoCotizacion = {
    items: [],
    total_items: 0,
    total_cantidad: 0,
    subtotal: 0,
    total_descuentos: 0,
    total: 0
  };
  
  // Estados
  carritoAbierto = true;
  cotizacionGuardando = false;
  
  // Usuario actual
  usuarioActual: any = null;

  // Escáner de códigos de barras
  scannerActivo = false;
  ultimoCodigoEscaneado = '';
  private scanSubscription: Subscription = new Subscription();

  constructor(
    private productosService: ProductosService,
    private cotizacionesService: CotizacionesService,
    private authService: AuthService,
    private barcodeScannerService: BarcodeScannerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarUsuarioActual();
    this.cargarProductos();
    this.inicializarEscaner();
  }

  ngOnDestroy(): void {
    this.scanSubscription.unsubscribe();
    this.barcodeScannerService.stopListening();
  }

  // ====================================================================
  // MÉTODOS DE CARGA DE DATOS
  // ====================================================================

  cargarUsuarioActual(): void {
    this.authService.getCurrentUser().subscribe(user => {
      this.usuarioActual = user;
    });
  }

  cargarProductos(): void {
    this.productosCargando = true;
    this.productosService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.productos = response.data;
          this.aplicarFiltros();
        }
        this.productosCargando = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.productosCargando = false;
      }
    });
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
    console.log('Escáner de códigos de barras activado');
  }

  desactivarEscaner(): void {
    this.barcodeScannerService.stopListening();
    console.log('Escáner de códigos de barras desactivado');
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
    console.log('Código escaneado:', codigo);

    // Buscar el producto por código de barras
    this.buscarProductoPorCodigo(codigo);
  }

  buscarProductoPorCodigo(codigo: string): void {
    this.productosService.findByCode(codigo).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const producto: Producto = response.data;
          console.log('Producto encontrado:', producto);
          
          // Agregar automáticamente al carrito
          this.agregarAlCarrito(producto);
          
          // Mostrar notificación visual (opcional)
          this.mostrarNotificacionProductoAgregado(producto);
        } else {
          console.warn('No se encontró producto con código:', codigo);
          this.mostrarNotificacionProductoNoEncontrado(codigo);
        }
      },
      error: (error) => {
        console.error('Error al buscar producto por código:', error);
        this.mostrarNotificacionError(codigo);
      }
    });
  }

  mostrarNotificacionProductoAgregado(producto: Producto): void {
    // Aquí puedes implementar una notificación toast o similar
    console.log(`✅ Producto agregado: ${producto.descripcion}`);
    
    // Opcional: Agregar clase CSS temporal para resaltar el producto agregado
    setTimeout(() => {
      const productoEnCarrito = document.querySelector(`[data-producto-id="${producto.id}"]`);
      if (productoEnCarrito) {
        productoEnCarrito.classList.add('producto-recien-agregado');
        setTimeout(() => {
          productoEnCarrito.classList.remove('producto-recien-agregado');
        }, 2000);
      }
    }, 100);
  }

  mostrarNotificacionProductoNoEncontrado(codigo: string): void {
    console.warn(`❌ No se encontró producto con código: ${codigo}`);
    // Aquí puedes implementar una notificación de error
  }

  mostrarNotificacionError(codigo: string): void {
    console.error(`❌ Error al buscar producto con código: ${codigo}`);
    // Aquí puedes implementar una notificación de error
  }

  // Método para testing - simular escaneo manual
  simularEscaneo(codigo: string): void {
    if (this.scannerActivo) {
      this.barcodeScannerService.simulateScan(codigo);
    } else {
      console.warn('El escáner no está activo');
    }
  }

  // ====================================================================
  // MÉTODOS DE FILTRADO
  // ====================================================================

  aplicarFiltros(): void {
    let productos = [...this.productos];

    // Filtro por texto
    if (this.filtroTexto.trim()) {
      const texto = this.filtroTexto.toLowerCase();
      productos = productos.filter(p => 
        p.descripcion.toLowerCase().includes(texto) ||
        p.cod.toLowerCase().includes(texto) ||
        (p.codigo_barras && p.codigo_barras.toLowerCase().includes(texto))
      );
    }

    // Filtro por stock
    if (this.filtroStock !== 'todos') {
      switch (this.filtroStock) {
        case 'con_stock':
          productos = productos.filter(p => p.cantidad > 0);
          break;
        case 'sin_stock':
          productos = productos.filter(p => p.cantidad === 0);
          break;
        case 'stock_bajo':
          productos = productos.filter(p => p.cantidad > 0 && p.cantidad <= 5);
          break;
      }
    }

    this.productosFiltrados = productos;
  }

  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtroCategoria = '';
    this.filtroStock = 'todos';
    this.aplicarFiltros();
  }

  // ====================================================================
  // MÉTODOS DEL CARRITO
  // ====================================================================

  agregarAlCarrito(producto: Producto): void {
    const itemExistente = this.carrito.items.find(item => item.id_producto === producto.id);
    
    if (itemExistente) {
      // Si ya existe, aumentar cantidad
      itemExistente.cantidad += 1;
    } else {
      // Si no existe, agregar nuevo item
      const nuevoItem: CarritoItem = {
        id_producto: producto.id,
        cod: producto.cod,
        descripcion: producto.descripcion,
        precio_unitario: producto.precio,
        cantidad: 1,
        descuento: 0,
        subtotal: producto.precio,
        stock_actual: producto.cantidad,
        imagen: producto.imagen,
        codigo_barras: producto.codigo_barras
      };
      this.carrito.items.push(nuevoItem);
    }
    
    this.actualizarCarrito();
  }

  quitarDelCarrito(idProducto: number): void {
    this.carrito.items = this.carrito.items.filter(item => item.id_producto !== idProducto);
    this.actualizarCarrito();
  }

  actualizarCantidad(idProducto: number, cantidad: number): void {
    const item = this.carrito.items.find(item => item.id_producto === idProducto);
    if (item) {
      if (cantidad <= 0) {
        this.quitarDelCarrito(idProducto);
      } else {
        item.cantidad = cantidad;
        this.actualizarCarrito();
      }
    }
  }


  actualizarDescuento(idProducto: number, descuento: number): void {
    const item = this.carrito.items.find(item => item.id_producto === idProducto);
    if (item) {
      item.descuento = descuento;
      this.actualizarCarrito();
    }
  }

  actualizarCarrito(): void {
    this.carrito.total_items = this.carrito.items.length;
    this.carrito.total_cantidad = this.carrito.items.reduce((sum, item) => sum + item.cantidad, 0);
    this.carrito.subtotal = this.carrito.items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
    this.carrito.total_descuentos = this.carrito.items.reduce((sum, item) => sum + item.descuento, 0);
    this.carrito.total = this.carrito.subtotal - this.carrito.total_descuentos;
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
  }

  // ====================================================================
  // MÉTODOS DE COTIZACIÓN
  // ====================================================================

  guardarCotizacion(): void {
    if (!this.usuarioActual || this.carrito.items.length === 0) {
      return;
    }

    this.cotizacionGuardando = true;

    const cotizacionData = {
      id_usuario: this.usuarioActual.id,
      productos: this.carrito.items.map(item => ({
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        descuento: item.descuento
      }))
    };

    this.cotizacionesService.createComplete(cotizacionData).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Cotización guardada:', response.data);
          this.limpiarCarrito();
          // Opcional: mostrar mensaje de éxito o redirigir
        }
        this.cotizacionGuardando = false;
      },
      error: (error) => {
        console.error('Error al guardar cotización:', error);
        this.cotizacionGuardando = false;
      }
    });
  }

  // ====================================================================
  // MÉTODOS DE NAVEGACIÓN
  // ====================================================================

  verListaCotizaciones(): void {
    this.router.navigate(['/cotizaciones/lista']);
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

  obtenerEstadoStock(cantidad: number): string {
    if (cantidad === 0) return 'Sin Stock';
    if (cantidad <= 5) return 'Stock Bajo';
    return 'Stock Normal';
  }

  obtenerColorEstadoStock(cantidad: number): string {
    if (cantidad === 0) return 'text-red-600 bg-red-100';
    if (cantidad <= 5) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  }

  // ====================================================================
  // MÉTODOS DE TRACKING PARA NG-FOR
  // ====================================================================

  trackByProductoId(index: number, item: CarritoItem): number {
    return item.id_producto;
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
}
