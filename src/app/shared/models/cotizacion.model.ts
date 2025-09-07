// ====================================================================
// MODELO DE DATOS PARA COTIZACIONES
// ====================================================================

export interface Cotizacion {
  id: number;
  cod: string;
  total: number;
  fecha: string;
  id_usuario: number;
  vendedor?: string;
  vendedor_ci?: string;
  vendedor_correo?: string;
  vendedor_rol?: string;
  total_items?: number;
  total_productos?: number;
  create_date?: string;
  update_date?: string;
}

export interface DetalleCotizacion {
  id: number;
  id_cotizacion: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  subtotal: number;
  producto_codigo?: string;
  codigo_barras?: string;
  producto_descripcion?: string;
  precio_actual_producto?: number;
  stock_actual?: number;
  estado_stock?: string;
  imagen?: string;
  create_date?: string;
  update_date?: string;
}

export interface CotizacionCompleta {
  cotizacion: Cotizacion;
  detalles: DetalleCotizacion[];
}

export interface CotizacionCreate {
  cod?: string;
  id_usuario: number;
}

export interface CotizacionUpdate {
  id_usuario: number;
}

export interface DetalleCotizacionCreate {
  id_cotizacion: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  descuento?: number;
}

export interface DetalleCotizacionUpdate {
  id_cotizacion: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
}

export interface CotizacionCompletaCreate {
  id_usuario: number;
  productos: Omit<DetalleCotizacionCreate, 'id_cotizacion'>[];
}

export interface CotizacionStats {
  total_cotizaciones: number;
  cotizaciones_hoy: number;
  cotizaciones_semana: number;
  cotizaciones_mes: number;
  valor_total_cotizado: number;
  valor_cotizado_hoy: number;
  valor_cotizado_semana: number;
  valor_cotizado_mes: number;
  cotizacion_promedio: number;
}

export interface CotizacionStatsByUser {
  id: number;
  nombre_completo: string;
  ci: string;
  total_cotizaciones: number;
  valor_total_cotizado: number;
  cotizacion_promedio: number;
  cotizaciones_hoy: number;
  valor_cotizado_hoy: number;
}

export interface CotizacionDailySummary {
  fecha: string;
  total_cotizaciones: number;
  valor_total_cotizado: number;
  cotizacion_promedio: number;
  usuarios_activos: number;
  productos_cotizados: number;
  productos_diferentes: number;
}

export interface TopQuotedProduct {
  id: number;
  cod: string;
  descripcion: string;
  precio: number;
  cantidad_cotizada: number;
  numero_cotizaciones: number;
  valor_total_cotizado: number;
}

export interface DetalleCotizacionStats {
  total_items_cotizados: number;
  items_cotizados_hoy: number;
  items_cotizados_semana: number;
  items_cotizados_mes: number;
  cantidad_total_cotizada: number;
  cantidad_cotizada_hoy: number;
  valor_items_total: number;
  valor_items_hoy: number;
  cantidad_promedio_por_item: number;
  precio_promedio: number;
  valor_promedio_por_item: number;
  productos_diferentes_cotizados: number;
  cotizaciones_con_items: number;
}

export interface PriceAnalysis {
  total_items: number;
  items_precio_mayor: number;
  items_precio_menor: number;
  items_precio_igual: number;
  precio_promedio_cotizado: number;
  precio_promedio_actual: number;
  diferencia_promedio_precios: number;
  descuentos_totales: number;
  descuento_promedio: number;
}

export interface DiscountAnalysis {
  total_items: number;
  items_con_descuento: number;
  items_sin_descuento: number;
  descuentos_totales: number;
  descuento_promedio: number;
  descuento_maximo: number;
  porcentaje_items_con_descuento: number;
}

export interface QuoterSummary {
  id: number;
  nombre_completo: string;
  ci: string;
  items_cotizados: number;
  cantidad_total_cotizada: number;
  valor_total_cotizado: number;
  productos_diferentes: number;
  cantidad_promedio_por_item: number;
  precio_promedio_cotizado: number;
  valor_promedio_por_item: number;
}

export interface CotizacionTotal {
  total_items: number;
  cantidad_total: number;
  total_cotizacion: number;
  descuentos_totales: number;
  precio_promedio: number;
}

export interface PriceComparison {
  id: number;
  producto_codigo: string;
  descripcion: string;
  precio_cotizado: number;
  precio_actual: number;
  diferencia_precio: number;
  cantidad: number;
  diferencia_total: number;
  comparacion: string;
}

// Interfaces para el carrito de cotización
export interface CarritoItem {
  id_producto: number;
  cod: string;
  descripcion: string;
  precio_unitario: number;
  cantidad: number;
  descuento: number;
  subtotal: number;
  stock_actual: number;
  imagen?: string;
  codigo_barras?: string;
}

export interface CarritoCotizacion {
  items: CarritoItem[];
  total_items: number;
  total_cantidad: number;
  subtotal: number;
  total_descuentos: number;
  total: number;
}
