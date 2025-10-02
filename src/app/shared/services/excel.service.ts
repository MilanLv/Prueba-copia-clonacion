import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Producto } from '../models/producto.model';

export interface ExcelImportResult {
  success: boolean;
  data: Producto[];
  errors: string[];
  warnings: string[];
  totalRows: number;
  validRows: number;
}

export interface ExcelExportOptions {
  filename?: string;
  includeHeaders?: boolean;
  sheetName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() { }

  /**
   * Exporta una lista de productos a un archivo Excel
   */
  exportProductsToExcel(products: Producto[], options: ExcelExportOptions = {}): void {
    try {
      // Preparar los datos para exportar
      const exportData = this.prepareProductsForExport(products);
      
      // Crear libro de trabajo
      const workbook = XLSX.utils.book_new();
      
      // Crear hoja de trabajo
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Configurar ancho de columnas
      const columnWidths = [
        { wch: 15 }, // Código
        { wch: 20 }, // Código de Barras
        { wch: 40 }, // Descripción
        { wch: 12 }, // Precio
        { wch: 10 }, // Cantidad
        { wch: 15 }, // Estado Stock
        { wch: 20 }, // Fecha Creación
        { wch: 20 }  // Fecha Actualización
      ];
      worksheet['!cols'] = columnWidths;

      // Agregar hoja al libro
      const sheetName = options.sheetName || 'Productos';
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // Generar nombre de archivo
      const filename = options.filename || `productos_${this.getCurrentDate()}.xlsx`;

      // Descargar archivo
      XLSX.writeFile(workbook, filename);

      console.log('✅ Archivo Excel exportado exitosamente:', filename);
    } catch (error) {
      console.error('❌ Error al exportar Excel:', error);
      throw new Error('Error al exportar el archivo Excel');
    }
  }

  /**
   * Exporta productos seleccionados a Excel
   */
  exportSelectedProductsToExcel(products: Producto[], filename?: string): void {
    if (products.length === 0) {
      alert('No hay productos seleccionados para exportar');
      return;
    }

    this.exportProductsToExcel(products, { 
      filename: filename || `productos_seleccionados_${this.getCurrentDate()}.xlsx` 
    });
  }

  /**
   * Exporta plantilla de Excel para importación
   */
  exportTemplateToExcel(): void {
    const templateData: Producto[] = [
      {
        id: 0,
        cod: 'PROD001',
        codigo_barras: '1234567890123',
        descripcion: 'Ejemplo de producto',
        precio: 25.50,
        cantidad: 100,
        imagen: 'imagen_producto.jpg',
        tiene_codigo_barras: true,
        codigo_barras_generado: false,
        create_date: new Date().toISOString(),
        update_date: new Date().toISOString(),
        estado_stock: 'Stock Normal',
        total_ventas: 0,
        total_cotizaciones: 0
      }
    ];

    this.exportProductsToExcel(templateData, {
      filename: `plantilla_importacion_productos_${this.getCurrentDate()}.xlsx`,
      sheetName: 'Plantilla'
    });
  }

  /**
   * Importa productos desde un archivo Excel
   */
  importProductsFromExcel(file: File): Promise<ExcelImportResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Obtener la primera hoja
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convertir a JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: ''
          });

          // Procesar los datos
          const result = this.processImportData(jsonData);
          resolve(result);
        } catch (error) {
          console.error('❌ Error al procesar archivo Excel:', error);
          reject(new Error('Error al procesar el archivo Excel'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Procesa los datos importados desde Excel
   */
  private processImportData(data: any[]): ExcelImportResult {
    const result: ExcelImportResult = {
      success: false,
      data: [],
      errors: [],
      warnings: [],
      totalRows: 0,
      validRows: 0
    };

    if (!data || data.length === 0) {
      result.errors.push('El archivo está vacío');
      return result;
    }

    // Obtener encabezados (primera fila)
    const headers = data[0] as string[];
    const headerMap = this.mapHeaders(headers);

    if (headerMap.errors.length > 0) {
      result.errors = headerMap.errors;
      return result;
    }

    // Procesar filas de datos (desde la segunda fila)
    const dataRows = data.slice(1);
    result.totalRows = dataRows.length;

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNumber = i + 2; // +2 porque empezamos desde la fila 2

      try {
        const producto = this.mapRowToProduct(row, headerMap.mapping, rowNumber);
        if (producto) {
          result.data.push(producto);
          result.validRows++;
        }
      } catch (error) {
        result.errors.push(`Fila ${rowNumber}: ${error}`);
      }
    }

    result.success = result.validRows > 0;

    // Agregar advertencias si hay filas vacías
    const emptyRows = result.totalRows - result.validRows - result.errors.length;
    if (emptyRows > 0) {
      result.warnings.push(`${emptyRows} filas están vacías y fueron omitidas`);
    }

    return result;
  }

  /**
   * Mapea los encabezados del Excel a los campos del modelo
   */
  private mapHeaders(headers: string[]): { mapping: any, errors: string[] } {
    const mapping: any = {};
    const errors: string[] = [];

    const validHeaders = {
      'cod': ['cod', 'codigo', 'código', 'code'],
      'codigo_barras': ['codigo_barras', 'codigo de barras', 'código de barras', 'barcode', 'codigo_barras_generado'],
      'descripcion': ['descripcion', 'descripción', 'nombre', 'producto', 'description'],
      'precio': ['precio', 'price', 'cost', 'costo'],
      'cantidad': ['cantidad', 'stock', 'quantity'],
      'imagen': ['imagen', 'image', 'foto', 'photo']
    };

    headers.forEach((header, index) => {
      const normalizedHeader = header.toLowerCase().trim();
      let mapped = false;

      for (const [field, variations] of Object.entries(validHeaders)) {
        if (variations.includes(normalizedHeader)) {
          mapping[field] = index;
          mapped = true;
          break;
        }
      }

      if (!mapped && normalizedHeader) {
        console.warn(`Encabezado no reconocido: ${header}`);
      }
    });

    // Validar campos obligatorios
    if (mapping.descripcion === undefined) {
      errors.push('Falta la columna "descripción" (requerida)');
    }
    if (mapping.precio === undefined) {
      errors.push('Falta la columna "precio" (requerida)');
    }

    return { mapping, errors };
  }

  /**
   * Convierte una fila de Excel a un objeto Producto
   */
  private mapRowToProduct(row: any[], mapping: any, rowNumber: number): Producto | null {
    // Verificar si la fila está vacía
    if (row.every(cell => !cell || cell.toString().trim() === '')) {
      return null;
    }

    const producto: any = {
      id: 0, // Se asignará en el backend
      create_date: new Date().toISOString(),
      update_date: new Date().toISOString(),
      tiene_codigo_barras: false,
      codigo_barras_generado: false,
      estado_stock: 'Stock Normal',
      total_ventas: 0,
      total_cotizaciones: 0
    };

    // Mapear campos
    if (mapping.cod !== undefined && row[mapping.cod]) {
      producto.cod = row[mapping.cod].toString().trim();
    }

    if (mapping.codigo_barras !== undefined && row[mapping.codigo_barras]) {
      producto.codigo_barras = row[mapping.codigo_barras].toString().trim();
      producto.tiene_codigo_barras = true;
    }

    if (mapping.descripcion !== undefined) {
      const descripcion = row[mapping.descripcion]?.toString().trim();
      if (!descripcion) {
        throw new Error('La descripción es requerida');
      }
      producto.descripcion = descripcion;
    } else {
      throw new Error('La descripción es requerida');
    }

    if (mapping.precio !== undefined) {
      const precio = this.parseNumber(row[mapping.precio], 'precio');
      if (precio === null || precio < 0) {
        throw new Error('El precio debe ser un número válido mayor o igual a 0');
      }
      producto.precio = precio;
    } else {
      throw new Error('El precio es requerido');
    }

    if (mapping.cantidad !== undefined && row[mapping.cantidad]) {
      const cantidad = this.parseNumber(row[mapping.cantidad], 'cantidad');
      if (cantidad !== null && cantidad >= 0) {
        producto.cantidad = cantidad;
      } else {
        producto.cantidad = 0;
      }
    } else {
      producto.cantidad = 0;
    }

    if (mapping.imagen !== undefined && row[mapping.imagen]) {
      producto.imagen = row[mapping.imagen].toString().trim();
    }

    return producto as Producto;
  }

  /**
   * Convierte un valor a número
   */
  private parseNumber(value: any, field: string): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const num = Number(value);
    if (isNaN(num)) {
      throw new Error(`El campo ${field} debe ser un número válido`);
    }

    return num;
  }

  /**
   * Prepara los datos de productos para exportación
   */
  private prepareProductsForExport(products: Producto[]): any[] {
    return products.map(producto => ({
      'Código': producto.cod || '',
      'Código de Barras': producto.codigo_barras || '',
      'Descripción': producto.descripcion || '',
      'Precio': producto.precio || 0,
      'Cantidad': producto.cantidad || 0,
      'Estado Stock': producto.estado_stock || '',
      'Fecha Creación': this.formatDate(producto.create_date),
      'Fecha Actualización': this.formatDate(producto.update_date)
    }));
  }

  /**
   * Formatea una fecha para mostrar
   */
  private formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }

  /**
   * Obtiene la fecha actual formateada
   */
  private getCurrentDate(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  /**
   * Valida el tipo de archivo
   */
  validateFileType(file: File): boolean {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];

    return validTypes.includes(file.type) || 
           file.name.toLowerCase().endsWith('.xlsx') ||
           file.name.toLowerCase().endsWith('.xls') ||
           file.name.toLowerCase().endsWith('.csv');
  }

  /**
   * Valida el tamaño del archivo
   */
  validateFileSize(file: File, maxSizeMB: number = 10): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }
}
