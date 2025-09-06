import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  Producto, 
  ProductoCreate, 
  ProductoUpdate, 
  ProductoStats, 
  ProductoTopSelling,
  ProductoStockUpdate,
  ProductoBarcodeAssign,
  ProductoBarcodeValidation,
  ProductoBarcodeGenerate,
  ProductoBarcodeBatch,
  ProductoSearch,
  ProductoCodeSearch,
  ProductoLowStock,
  ProductoTopSellingParams
} from '../models/producto.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private readonly API_URL = `${environment.apiUrl}/productos`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private getFormDataHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Obtener todos los productos
  getAll(): Observable<any> {
    return this.http.get(`${this.API_URL}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Obtener estadísticas de productos
  getStats(): Observable<any> {
    return this.http.get(`${this.API_URL}/stats`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Obtener productos con stock bajo
  getLowStock(limite: number = 5): Observable<any> {
    const params = new HttpParams().set('limite', limite.toString());
    return this.http.get(`${this.API_URL}/low-stock`, { 
      headers: this.getHeaders(),
      params: params
    }).pipe(catchError(this.handleError));
  }

  // Obtener productos sin código de barras
  getWithoutBarcode(): Observable<any> {
    return this.http.get(`${this.API_URL}/without-barcode`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Obtener productos más vendidos
  getTopSelling(limit: number = 10): Observable<any> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get(`${this.API_URL}/top-selling`, { 
      headers: this.getHeaders(),
      params: params
    }).pipe(catchError(this.handleError));
  }

  // Buscar productos por descripción
  search(searchTerm: string): Observable<any> {
    const params = new HttpParams().set('q', searchTerm);
    return this.http.get(`${this.API_URL}/search`, { 
      headers: this.getHeaders(),
      params: params
    }).pipe(catchError(this.handleError));
  }

  // Buscar producto por código (interno o de barras)
  findByCode(codigo: string): Observable<any> {
    return this.http.get(`${this.API_URL}/code/${codigo}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Obtener producto por ID
  getById(id: number): Observable<any> {
    return this.http.get(`${this.API_URL}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Obtener imagen del producto
  getImage(filename: string): string {
    return `${this.API_URL}/image/${filename}`;
  }

  // Crear producto
  create(producto: ProductoCreate, imagen?: File): Observable<any> {
    const formData = new FormData();
    
    // Agregar datos del producto
    Object.keys(producto).forEach(key => {
      if (producto[key as keyof ProductoCreate] !== null && producto[key as keyof ProductoCreate] !== undefined) {
        formData.append(key, producto[key as keyof ProductoCreate] as string);
      }
    });

    // Agregar imagen si existe
    if (imagen) {
      formData.append('imagen', imagen);
    }

    return this.http.post(`${this.API_URL}`, formData, { 
      headers: this.getFormDataHeaders()
    }).pipe(catchError(this.handleError));
  }

  // Actualizar producto
  update(id: number, producto: ProductoUpdate, imagen?: File): Observable<any> {
    const formData = new FormData();
    
    // Agregar datos del producto
    Object.keys(producto).forEach(key => {
      if (producto[key as keyof ProductoUpdate] !== null && producto[key as keyof ProductoUpdate] !== undefined) {
        formData.append(key, producto[key as keyof ProductoUpdate] as string);
      }
    });

    // Agregar imagen si existe
    if (imagen) {
      formData.append('imagen', imagen);
    }

    return this.http.put(`${this.API_URL}/${id}`, formData, { 
      headers: this.getFormDataHeaders()
    }).pipe(catchError(this.handleError));
  }

  // Actualizar stock del producto
  updateStock(id: number, stockData: ProductoStockUpdate): Observable<any> {
    return this.http.put(`${this.API_URL}/${id}/stock`, stockData, { 
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  // Asignar código de barras
  assignBarcode(id: number, barcodeData: ProductoBarcodeAssign): Observable<any> {
    return this.http.put(`${this.API_URL}/${id}/barcode`, barcodeData, { 
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  // Generar código de barras automático
  generateBarcode(id: number): Observable<any> {
    return this.http.post(`${this.API_URL}/${id}/generate-barcode`, {}, { 
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  // Generar códigos de barras masivamente
  generateBarcodesBatch(): Observable<any> {
    return this.http.post(`${this.API_URL}/generate-barcodes-batch`, {}, { 
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  // Validar formato de código de barras
  validateBarcode(barcodeData: { codigo_barras: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/validate-barcode`, barcodeData, { 
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  // Eliminar producto
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('Productos Service Error:', error);
    return throwError(() => error);
  }
}
