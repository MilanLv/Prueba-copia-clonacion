// ====================================================================
// MODELOS PARA EL MÓDULO DE VENTAS
// ====================================================================

export interface Venta {
  id: number;
  cod: string;
  total: number;
  fecha: string;
  id_usuario: number;
  create_date: string;
  update_date: string;
  // Campos adicionales de consultas
  vendedor?: string;
  vendedor_ci?: string;
  vendedor_correo?: string;
  vendedor_rol?: string;
  total_items?: number;
  total_productos?: number;
}

export interface DetalleVenta {
  id: number;
  id_venta: number;
  id_producto: number;
  cantidad: number;
  descuento: number;
  subtotal: number;
  create_date: string;
  update_date: string;
  // Campos adicionales de consultas
  venta_codigo?: string;
  venta_fecha?: string;
  venta_total?: number;
  vendedor?: string;
  vendedor_ci?: string;
  producto_codigo?: string;
  codigo_barras?: string;
  producto_descripcion?: string;
  precio_actual_producto?: number;
  stock_actual?: number;
  estado_stock?: string;
  imagen?: string;
}

export interface VentaCompleta {
  venta: Venta;
  detalles: DetalleVenta[];
}

// Interfaces para crear ventas
export interface VentaCreate {
  cod?: string;
  id_usuario: number;
}

export interface DetalleVentaCreate {
  id_venta: number;
  id_producto: number;
  cantidad: number;
  descuento?: number;
}

export interface VentaCompletaCreate {
  id_usuario: number;
  productos: Omit<DetalleVentaCreate, 'id_venta'>[];
}

// Interfaces para actualizar ventas
export interface VentaUpdate {
  id_usuario: number;
}

export interface DetalleVentaUpdate {
  id_venta: number;
  id_producto: number;
  cantidad: number;
  descuento: number;
}

// Interfaces para estadísticas
export interface VentaStats {
  total_ventas: number;
  ventas_hoy: number;
  ventas_semana: number;
  ventas_mes: number;
  ingresos_total: number;
  ingresos_hoy: number;
  ingresos_semana: number;
  ingresos_mes: number;
  ticket_promedio: number;
}

export interface VentaStatsByUser {
  id: number;
  nombre_completo: string;
  ci: string;
  total_ventas: number;
  ingresos_total: number;
  ticket_promedio: number;
  ventas_hoy: number;
  ingresos_hoy: number;
}

export interface VentaDailySummary {
  fecha: string;
  total_ventas: number;
  ingresos_total: number;
  ticket_promedio: number;
  vendedores_activos: number;
  productos_vendidos: number;
  productos_diferentes: number;
}

export interface VentaTopProduct {
  id: number;
  cod: string;
  descripcion: string;
  precio: number;
  cantidad_vendida: number;
  numero_transacciones: number;
  ingresos_producto: number;
}

export interface VentaByHour {
  hora: number;
  numero_ventas: number;
  ingresos_hora: number;
  ticket_promedio: number;
}

// Interfaces para filtros y búsquedas
export interface VentaFilterParams {
  fecha_inicio?: string;
  fecha_fin?: string;
  id_usuario?: number;
  cod?: string;
}

export interface VentaSearchParams {
  q: string;
}

// Interfaces para el carrito de ventas
export interface CarritoItemVenta {
  id_producto: number;
  codigo: string;
  descripcion: string;
  precio_unitario: number;
  cantidad: number;
  descuento: number;
  subtotal: number;
  imagen?: string;
  stock_actual: number;
  estado_stock: string;
}

export interface CarritoVenta {
  items: CarritoItemVenta[];
  total_items: number;
  total_cantidad: number;
  subtotal: number;
  total_descuentos: number;
  total: number;
}

// Interfaces para productos en ventas
export interface ProductoVenta {
  id: number;
  cod: string;
  codigo_barras: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  imagen?: string;
  estado_stock: string;
}

export interface ProductoVentaSearch {
  termino: string;
  categoria?: string;
  estado_stock?: string;
}

export interface ProductoVentaFilter {
  categoria?: string;
  estado_stock?: string;
  precio_min?: number;
  precio_max?: number;
}

export interface ProductoVentaPagination {
  pagina: number;
  items_por_pagina: number;
  total_items: number;
  total_paginas: number;
}
