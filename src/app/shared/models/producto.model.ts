export interface Producto {
  id: number;
  cod: string;
  codigo_barras: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  imagen: string;
  tiene_codigo_barras: boolean;
  codigo_barras_generado: boolean;
  create_date: string;
  update_date: string;
  estado_stock: string;
  total_ventas: number;
  total_cotizaciones: number;
  encontrado_por?: string;
  selected?: boolean;
}

export interface ProductoCreate {
  cod?: string;
  codigo_barras?: string;
  descripcion: string;
  precio: number;
  cantidad?: number;
  imagen?: string;
}

export interface ProductoUpdate {
  cod?: string;
  codigo_barras?: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  imagen?: string;
}

export interface ProductoStats {
  total_productos: number;
  con_stock: number;
  sin_stock: number;
  stock_bajo: number;
  con_codigo_barras: number;
  sin_codigo_barras: number;
  precio_promedio: number;
  valor_inventario: number;
}

export interface ProductoTopSelling {
  id: number;
  cod: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  total_ventas: number;
  cantidad_vendida: number;
}

export interface ProductoStockUpdate {
  cantidad: number;
}

export interface ProductoBarcodeAssign {
  codigo_barras: string;
}

export interface ProductoBarcodeValidation {
  valido: boolean;
  formato: string;
  mensaje: string;
}

export interface ProductoBarcodeGenerate {
  producto_id: number;
  codigo_generado: string;
}

export interface ProductoBarcodeBatch {
  total_procesados: number;
  exitosos: number;
  fallidos: number;
  detalle: Array<{
    producto_id: number;
    cod: string;
    descripcion: string;
    procesado: boolean;
    codigo_generado?: string;
    error?: string;
  }>;
}

export interface ProductoSearch {
  q: string;
}

export interface ProductoCodeSearch {
  codigo: string;
}

export interface ProductoLowStock {
  limite?: number;
}

export interface ProductoTopSellingParams {
  limit?: number;
}
