// ====================================================================
// SERVICIO DE COTIZACIONES
// ====================================================================
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import {
  Cotizacion,
  DetalleCotizacion,
  CotizacionCompleta,
  CotizacionCreate,
  CotizacionUpdate,
  DetalleCotizacionCreate,
  DetalleCotizacionUpdate,
  CotizacionCompletaCreate,
  CotizacionStats,
  CotizacionStatsByUser,
  CotizacionDailySummary,
  TopQuotedProduct,
  DetalleCotizacionStats,
  PriceAnalysis,
  DiscountAnalysis,
  QuoterSummary,
  CotizacionTotal,
  PriceComparison
} from '../models/cotizacion.model';

@Injectable({
  providedIn: 'root'
})
export class CotizacionesService {
  private apiUrl = `${environment.apiUrl}/cotizaciones`;
  private detalleApiUrl = `${environment.apiUrl}/detalle-cotizaciones`;

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
  // MÉTODOS DE COTIZACIONES
  // ====================================================================

  // Obtener todas las cotizaciones
  getAll(): Observable<{ success: boolean; data: Cotizacion[]; message: string }> {
    return this.http.get<{ success: boolean; data: Cotizacion[]; message: string }>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  // Obtener cotización por ID
  getById(id: number): Observable<{ success: boolean; data: Cotizacion; message: string }> {
    return this.http.get<{ success: boolean; data: Cotizacion; message: string }>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Obtener cotización con detalles completos
  getWithDetails(id: number): Observable<{ success: boolean; data: CotizacionCompleta; message: string }> {
    return this.http.get<{ success: boolean; data: CotizacionCompleta; message: string }>(`${this.apiUrl}/${id}/details`, {
      headers: this.getHeaders()
    });
  }

  // Crear cotización básica
  create(cotizacion: CotizacionCreate): Observable<{ success: boolean; data: Cotizacion; message: string }> {
    return this.http.post<{ success: boolean; data: Cotizacion; message: string }>(this.apiUrl, cotizacion, {
      headers: this.getHeaders()
    });
  }

  // Crear cotización completa con detalles
  createComplete(cotizacion: CotizacionCompletaCreate): Observable<{ success: boolean; data: CotizacionCompleta; message: string }> {
    return this.http.post<{ success: boolean; data: CotizacionCompleta; message: string }>(`${this.apiUrl}/complete`, cotizacion, {
      headers: this.getHeaders()
    });
  }

  // Actualizar cotización
  update(id: number, cotizacion: CotizacionUpdate): Observable<{ success: boolean; data: Cotizacion; message: string }> {
    return this.http.put<{ success: boolean; data: Cotizacion; message: string }>(`${this.apiUrl}/${id}`, cotizacion, {
      headers: this.getHeaders()
    });
  }

  // Eliminar cotización
  delete(id: number): Observable<{ success: boolean; data: Cotizacion; message: string }> {
    return this.http.delete<{ success: boolean; data: Cotizacion; message: string }>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Convertir cotización a venta
  convertToSale(id: number, idUsuarioVenta?: number): Observable<{ success: boolean; data: any; message: string }> {
    const body = idUsuarioVenta ? { id_usuario_venta: idUsuarioVenta } : {};
    return this.http.post<{ success: boolean; data: any; message: string }>(`${this.apiUrl}/${id}/convert-to-sale`, body, {
      headers: this.getHeaders()
    });
  }

  // ====================================================================
  // MÉTODOS DE BÚSQUEDA Y FILTROS
  // ====================================================================

  // Buscar cotizaciones por código
  search(query: string): Observable<{ success: boolean; data: Cotizacion[]; message: string }> {
    const params = new HttpParams().set('q', query);
    return this.http.get<{ success: boolean; data: Cotizacion[]; message: string }>(`${this.apiUrl}/search`, {
      headers: this.getHeaders(),
      params
    });
  }

  // Obtener cotizaciones por rango de fechas
  getByDateRange(fechaInicio: string, fechaFin: string): Observable<{ success: boolean; data: Cotizacion[]; message: string }> {
    const params = new HttpParams()
      .set('fecha_inicio', fechaInicio)
      .set('fecha_fin', fechaFin);
    return this.http.get<{ success: boolean; data: Cotizacion[]; message: string }>(`${this.apiUrl}/date-range`, {
      headers: this.getHeaders(),
      params
    });
  }

  // Obtener cotizaciones por usuario
  getByUser(userId: number): Observable<{ success: boolean; data: Cotizacion[]; message: string }> {
    return this.http.get<{ success: boolean; data: Cotizacion[]; message: string }>(`${this.apiUrl}/user/${userId}`, {
      headers: this.getHeaders()
    });
  }

  // Obtener cotizaciones del día
  getTodaysQuotes(): Observable<{ success: boolean; data: Cotizacion[]; message: string }> {
    return this.http.get<{ success: boolean; data: Cotizacion[]; message: string }>(`${this.apiUrl}/today`, {
      headers: this.getHeaders()
    });
  }

  // ====================================================================
  // MÉTODOS DE ESTADÍSTICAS
  // ====================================================================

  // Obtener estadísticas generales
  getStats(): Observable<{ success: boolean; data: CotizacionStats; message: string }> {
    return this.http.get<{ success: boolean; data: CotizacionStats; message: string }>(`${this.apiUrl}/stats`, {
      headers: this.getHeaders()
    });
  }

  // Obtener estadísticas por usuario
  getStatsByUser(): Observable<{ success: boolean; data: CotizacionStatsByUser[]; message: string }> {
    return this.http.get<{ success: boolean; data: CotizacionStatsByUser[]; message: string }>(`${this.apiUrl}/by-user`, {
      headers: this.getHeaders()
    });
  }

  // Obtener resumen diario
  getDailySummary(fecha?: string): Observable<{ success: boolean; data: CotizacionDailySummary; message: string }> {
    const params = fecha ? new HttpParams().set('fecha', fecha) : new HttpParams();
    return this.http.get<{ success: boolean; data: CotizacionDailySummary; message: string }>(`${this.apiUrl}/daily-summary`, {
      headers: this.getHeaders(),
      params
    });
  }

  // Obtener top productos cotizados
  getTopProducts(dias: number = 30): Observable<{ success: boolean; data: TopQuotedProduct[]; message: string }> {
    const params = new HttpParams().set('dias', dias.toString());
    return this.http.get<{ success: boolean; data: TopQuotedProduct[]; message: string }>(`${this.apiUrl}/top-products`, {
      headers: this.getHeaders(),
      params
    });
  }

  // ====================================================================
  // MÉTODOS DE DETALLES DE COTIZACIÓN
  // ====================================================================

  // Obtener todos los detalles
  getAllDetalles(): Observable<{ success: boolean; data: DetalleCotizacion[]; message: string }> {
    return this.http.get<{ success: boolean; data: DetalleCotizacion[]; message: string }>(this.detalleApiUrl, {
      headers: this.getHeaders()
    });
  }

  // Obtener detalle por ID
  getDetalleById(id: number): Observable<{ success: boolean; data: DetalleCotizacion; message: string }> {
    return this.http.get<{ success: boolean; data: DetalleCotizacion; message: string }>(`${this.detalleApiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Obtener detalles por cotización
  getDetallesByCotizacion(cotizacionId: number): Observable<{ success: boolean; data: DetalleCotizacion[]; message: string }> {
    return this.http.get<{ success: boolean; data: DetalleCotizacion[]; message: string }>(`${this.detalleApiUrl}/cotizacion/${cotizacionId}`, {
      headers: this.getHeaders()
    });
  }

  // Obtener detalles por producto
  getDetallesByProducto(productoId: number): Observable<{ success: boolean; data: DetalleCotizacion[]; message: string }> {
    return this.http.get<{ success: boolean; data: DetalleCotizacion[]; message: string }>(`${this.detalleApiUrl}/producto/${productoId}`, {
      headers: this.getHeaders()
    });
  }

  // Crear detalle individual
  createDetalle(detalle: DetalleCotizacionCreate): Observable<{ success: boolean; data: DetalleCotizacion; message: string }> {
    return this.http.post<{ success: boolean; data: DetalleCotizacion; message: string }>(this.detalleApiUrl, detalle, {
      headers: this.getHeaders()
    });
  }

  // Crear detalles por lote
  createDetallesBatch(cotizacionId: number, detalles: Omit<DetalleCotizacionCreate, 'id_cotizacion'>[]): Observable<{ success: boolean; data: DetalleCotizacion[]; message: string }> {
    return this.http.post<{ success: boolean; data: DetalleCotizacion[]; message: string }>(`${this.detalleApiUrl}/batch`, {
      id_cotizacion: cotizacionId,
      detalles
    }, {
      headers: this.getHeaders()
    });
  }

  // Actualizar detalle completo
  updateDetalle(id: number, detalle: DetalleCotizacionUpdate): Observable<{ success: boolean; data: DetalleCotizacion; message: string }> {
    return this.http.put<{ success: boolean; data: DetalleCotizacion; message: string }>(`${this.detalleApiUrl}/${id}`, detalle, {
      headers: this.getHeaders()
    });
  }

  // Actualizar solo cantidad
  updateDetalleCantidad(id: number, cantidad: number): Observable<{ success: boolean; data: DetalleCotizacion; message: string }> {
    return this.http.put<{ success: boolean; data: DetalleCotizacion; message: string }>(`${this.detalleApiUrl}/${id}/quantity`, { cantidad }, {
      headers: this.getHeaders()
    });
  }

  // Actualizar solo precio
  updateDetallePrecio(id: number, precio_unitario: number): Observable<{ success: boolean; data: DetalleCotizacion; message: string }> {
    return this.http.put<{ success: boolean; data: DetalleCotizacion; message: string }>(`${this.detalleApiUrl}/${id}/price`, { precio_unitario }, {
      headers: this.getHeaders()
    });
  }

  // Actualizar solo descuento
  updateDetalleDescuento(id: number, descuento: number): Observable<{ success: boolean; data: DetalleCotizacion; message: string }> {
    return this.http.put<{ success: boolean; data: DetalleCotizacion; message: string }>(`${this.detalleApiUrl}/${id}/discount`, { descuento }, {
      headers: this.getHeaders()
    });
  }

  // Eliminar detalle
  deleteDetalle(id: number): Observable<{ success: boolean; data: DetalleCotizacion; message: string }> {
    return this.http.delete<{ success: boolean; data: DetalleCotizacion; message: string }>(`${this.detalleApiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Eliminar todos los detalles de una cotización
  deleteDetallesByCotizacion(cotizacionId: number): Observable<{ success: boolean; data: DetalleCotizacion[]; message: string }> {
    return this.http.delete<{ success: boolean; data: DetalleCotizacion[]; message: string }>(`${this.detalleApiUrl}/cotizacion/${cotizacionId}`, {
      headers: this.getHeaders()
    });
  }

  // ====================================================================
  // MÉTODOS DE ANÁLISIS Y ESTADÍSTICAS DE DETALLES
  // ====================================================================

  // Obtener estadísticas de detalles
  getDetallesStats(): Observable<{ success: boolean; data: DetalleCotizacionStats; message: string }> {
    return this.http.get<{ success: boolean; data: DetalleCotizacionStats; message: string }>(`${this.detalleApiUrl}/stats`, {
      headers: this.getHeaders()
    });
  }

  // Obtener top productos cotizados
  getTopQuotedProducts(limit: number = 10): Observable<{ success: boolean; data: TopQuotedProduct[]; message: string }> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<{ success: boolean; data: TopQuotedProduct[]; message: string }>(`${this.detalleApiUrl}/top-quoted`, {
      headers: this.getHeaders(),
      params
    });
  }

  // Obtener top productos por valor
  getTopValueProducts(limit: number = 10): Observable<{ success: boolean; data: TopQuotedProduct[]; message: string }> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<{ success: boolean; data: TopQuotedProduct[]; message: string }>(`${this.detalleApiUrl}/top-value`, {
      headers: this.getHeaders(),
      params
    });
  }

  // Obtener análisis de precios
  getPriceAnalysis(): Observable<{ success: boolean; data: PriceAnalysis; message: string }> {
    return this.http.get<{ success: boolean; data: PriceAnalysis; message: string }>(`${this.detalleApiUrl}/price-analysis`, {
      headers: this.getHeaders()
    });
  }

  // Obtener análisis de descuentos
  getDiscountAnalysis(): Observable<{ success: boolean; data: DiscountAnalysis; message: string }> {
    return this.http.get<{ success: boolean; data: DiscountAnalysis; message: string }>(`${this.detalleApiUrl}/discount-analysis`, {
      headers: this.getHeaders()
    });
  }

  // Obtener resumen por cotizador
  getQuoterSummary(): Observable<{ success: boolean; data: QuoterSummary[]; message: string }> {
    return this.http.get<{ success: boolean; data: QuoterSummary[]; message: string }>(`${this.detalleApiUrl}/quoter-summary`, {
      headers: this.getHeaders()
    });
  }

  // Obtener totales de una cotización
  getCotizacionTotal(cotizacionId: number): Observable<{ success: boolean; data: CotizacionTotal; message: string }> {
    return this.http.get<{ success: boolean; data: CotizacionTotal; message: string }>(`${this.detalleApiUrl}/cotizacion/${cotizacionId}/total`, {
      headers: this.getHeaders()
    });
  }

  // Obtener comparación de precios
  getPriceComparison(cotizacionId: number): Observable<{ success: boolean; data: PriceComparison[]; message: string }> {
    return this.http.get<{ success: boolean; data: PriceComparison[]; message: string }>(`${this.detalleApiUrl}/cotizacion/${cotizacionId}/price-comparison`, {
      headers: this.getHeaders()
    });
  }
}
