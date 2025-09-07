import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import {
  Venta,
  DetalleVenta,
  VentaCompleta,
  VentaCreate,
  VentaUpdate,
  DetalleVentaCreate,
  DetalleVentaUpdate,
  VentaStats,
  VentaStatsByUser,
  VentaDailySummary,
  VentaTopProduct,
  VentaByHour,
  VentaCompletaCreate,
  VentaFilterParams,
  VentaSearchParams,
  ProductoVenta
} from '../models/venta.model';

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private apiUrl = `${environment.apiUrl}/ventas`;
  private detalleApiUrl = `${environment.apiUrl}/detalle-productos`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ====================================================================
  // MÉTODOS PARA VENTAS
  // ====================================================================

  // Obtener todas las ventas
  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders() });
  }

  // Obtener venta por ID
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Obtener venta con detalles completos
  getWithDetails(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/details`, { headers: this.getHeaders() });
  }

  // Crear venta
  create(venta: VentaCreate): Observable<any> {
    return this.http.post<any>(this.apiUrl, venta, { headers: this.getHeaders() });
  }

  // Crear venta completa con detalles
  createComplete(ventaCompleta: VentaCompletaCreate): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/complete`, ventaCompleta, { headers: this.getHeaders() });
  }

  // Actualizar venta
  update(id: number, venta: VentaUpdate): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, venta, { headers: this.getHeaders() });
  }

  // Eliminar venta
  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // ====================================================================
  // MÉTODOS DE BÚSQUEDA Y FILTROS
  // ====================================================================

  // Buscar ventas por código
  search(params: VentaSearchParams): Observable<any> {
    const queryParams = new HttpParams().set('q', params.q);
    return this.http.get<any>(`${this.apiUrl}/search`, { 
      headers: this.getHeaders(), 
      params: queryParams 
    });
  }

  // Obtener ventas por rango de fechas
  getByDateRange(fechaInicio: string, fechaFin: string): Observable<any> {
    const queryParams = new HttpParams()
      .set('fecha_inicio', fechaInicio)
      .set('fecha_fin', fechaFin);
    return this.http.get<any>(`${this.apiUrl}/date-range`, { 
      headers: this.getHeaders(), 
      params: queryParams 
    });
  }

  // Obtener ventas por usuario
  getByUser(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/${userId}`, { headers: this.getHeaders() });
  }

  // ====================================================================
  // MÉTODOS DE ESTADÍSTICAS Y REPORTES
  // ====================================================================

  // Obtener estadísticas generales
  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`, { headers: this.getHeaders() });
  }

  // Obtener ventas del día
  getTodaysSales(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/today`, { headers: this.getHeaders() });
  }

  // Obtener estadísticas por vendedor
  getStatsByUser(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/by-user`, { headers: this.getHeaders() });
  }

  // Obtener resumen diario
  getDailySummary(fecha?: string): Observable<any> {
    let queryParams = new HttpParams();
    if (fecha) {
      queryParams = queryParams.set('fecha', fecha);
    }
    return this.http.get<any>(`${this.apiUrl}/daily-summary`, { 
      headers: this.getHeaders(), 
      params: queryParams 
    });
  }

  // Obtener top productos
  getTopProducts(dias: number = 30): Observable<any> {
    const queryParams = new HttpParams().set('dias', dias.toString());
    return this.http.get<any>(`${this.apiUrl}/top-products`, { 
      headers: this.getHeaders(), 
      params: queryParams 
    });
  }

  // Obtener ventas por hora
  getSalesByHour(fecha?: string): Observable<any> {
    let queryParams = new HttpParams();
    if (fecha) {
      queryParams = queryParams.set('fecha', fecha);
    }
    return this.http.get<any>(`${this.apiUrl}/by-hour`, { 
      headers: this.getHeaders(), 
      params: queryParams 
    });
  }

  // ====================================================================
  // MÉTODOS PARA DETALLE DE VENTAS
  // ====================================================================

  // Obtener todos los detalles
  getAllDetalles(): Observable<any> {
    return this.http.get<any>(this.detalleApiUrl, { headers: this.getHeaders() });
  }

  // Obtener detalle por ID
  getDetalleById(id: number): Observable<any> {
    return this.http.get<any>(`${this.detalleApiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Obtener detalles por venta
  getDetallesByVenta(ventaId: number): Observable<any> {
    return this.http.get<any>(`${this.detalleApiUrl}/venta/${ventaId}`, { headers: this.getHeaders() });
  }

  // Obtener detalles por producto
  getDetallesByProducto(productoId: number): Observable<any> {
    return this.http.get<any>(`${this.detalleApiUrl}/producto/${productoId}`, { headers: this.getHeaders() });
  }

  // Crear detalle
  createDetalle(detalle: DetalleVentaCreate): Observable<any> {
    return this.http.post<any>(this.detalleApiUrl, detalle, { headers: this.getHeaders() });
  }

  // Crear detalles en lote
  createDetallesBatch(ventaId: number, detalles: Omit<DetalleVentaCreate, 'id_venta'>[]): Observable<any> {
    return this.http.post<any>(`${this.detalleApiUrl}/batch`, {
      id_venta: ventaId,
      detalles: detalles
    }, { headers: this.getHeaders() });
  }

  // Actualizar detalle
  updateDetalle(id: number, detalle: DetalleVentaUpdate): Observable<any> {
    return this.http.put<any>(`${this.detalleApiUrl}/${id}`, detalle, { headers: this.getHeaders() });
  }

  // Actualizar solo cantidad
  updateDetalleQuantity(id: number, cantidad: number): Observable<any> {
    return this.http.put<any>(`${this.detalleApiUrl}/${id}/quantity`, { cantidad }, { headers: this.getHeaders() });
  }

  // Actualizar solo descuento
  updateDetalleDiscount(id: number, descuento: number): Observable<any> {
    return this.http.put<any>(`${this.detalleApiUrl}/${id}/discount`, { descuento }, { headers: this.getHeaders() });
  }

  // Eliminar detalle
  deleteDetalle(id: number): Observable<any> {
    return this.http.delete<any>(`${this.detalleApiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Eliminar todos los detalles de una venta
  deleteDetallesByVenta(ventaId: number): Observable<any> {
    return this.http.delete<any>(`${this.detalleApiUrl}/venta/${ventaId}`, { headers: this.getHeaders() });
  }

  // ====================================================================
  // MÉTODOS DE ESTADÍSTICAS PARA DETALLES
  // ====================================================================

  // Obtener estadísticas de detalles
  getDetallesStats(): Observable<any> {
    return this.http.get<any>(`${this.detalleApiUrl}/stats`, { headers: this.getHeaders() });
  }

  // Obtener detalles del día
  getTodaysDetalles(): Observable<any> {
    return this.http.get<any>(`${this.detalleApiUrl}/today`, { headers: this.getHeaders() });
  }

  // Obtener productos más vendidos
  getTopSellingProducts(limit: number = 10): Observable<any> {
    const queryParams = new HttpParams().set('limit', limit.toString());
    return this.http.get<any>(`${this.detalleApiUrl}/top-selling`, { 
      headers: this.getHeaders(), 
      params: queryParams 
    });
  }

  // Obtener productos con más ingresos
  getTopRevenueProducts(limit: number = 10): Observable<any> {
    const queryParams = new HttpParams().set('limit', limit.toString());
    return this.http.get<any>(`${this.detalleApiUrl}/top-revenue`, { 
      headers: this.getHeaders(), 
      params: queryParams 
    });
  }

  // Obtener análisis de descuentos
  getDiscountAnalysis(): Observable<any> {
    return this.http.get<any>(`${this.detalleApiUrl}/discount-analysis`, { headers: this.getHeaders() });
  }

  // Obtener resumen por vendedor
  getSellerSummary(): Observable<any> {
    return this.http.get<any>(`${this.detalleApiUrl}/seller-summary`, { headers: this.getHeaders() });
  }

  // Obtener detalles por rango de fechas
  getDetallesByDateRange(fechaInicio: string, fechaFin: string): Observable<any> {
    const queryParams = new HttpParams()
      .set('fecha_inicio', fechaInicio)
      .set('fecha_fin', fechaFin);
    return this.http.get<any>(`${this.detalleApiUrl}/date-range`, { 
      headers: this.getHeaders(), 
      params: queryParams 
    });
  }

  // Calcular totales de una venta
  getVentaTotal(ventaId: number): Observable<any> {
    return this.http.get<any>(`${this.detalleApiUrl}/venta/${ventaId}/total`, { headers: this.getHeaders() });
  }
}
