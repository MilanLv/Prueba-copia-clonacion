import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export interface ScanResult {
  code: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class BarcodeScannerService {
  private scanSubject = new Subject<ScanResult>();
  private isListening = new BehaviorSubject<boolean>(false);
  private buffer = '';
  private lastKeyTime = 0;
  private readonly SCAN_THRESHOLD = 100; // milliseconds between characters for barcode scanner

  constructor(private ngZone: NgZone) {
    this.initializeKeyboardListener();
  }

  /**
   * Observable para escuchar códigos escaneados
   */
  get onScan$(): Observable<ScanResult> {
    return this.scanSubject.asObservable();
  }

  /**
   * Observable para verificar si está escuchando
   */
  get isListening$(): Observable<boolean> {
    return this.isListening.asObservable();
  }

  /**
   * Iniciar escucha de códigos de barras
   */
  startListening(): void {
    this.isListening.next(true);
  }

  /**
   * Detener escucha de códigos de barras
   */
  stopListening(): void {
    this.isListening.next(false);
    this.buffer = '';
  }

  /**
   * Verificar si está escuchando actualmente
   */
  get isCurrentlyListening(): boolean {
    return this.isListening.value;
  }

  /**
   * Inicializar el listener del teclado para capturar códigos de barras
   */
  private initializeKeyboardListener(): void {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (!this.isCurrentlyListening) return;

      const currentTime = Date.now();
      
      // Si pasó mucho tiempo desde la última tecla, reiniciar buffer
      if (currentTime - this.lastKeyTime > this.SCAN_THRESHOLD) {
        this.buffer = '';
      }
      
      this.lastKeyTime = currentTime;

      // Capturar caracteres
      if (event.key.length === 1) {
        this.buffer += event.key;
        event.preventDefault();
      }
      
      // Enter indica fin del código escaneado
      else if (event.key === 'Enter') {
        if (this.buffer.length > 0) {
          this.ngZone.run(() => {
            this.scanSubject.next({
              code: this.buffer.trim(),
              timestamp: new Date()
            });
          });
          this.buffer = '';
        }
        event.preventDefault();
      }
      
      // Escape para limpiar buffer
      else if (event.key === 'Escape') {
        this.buffer = '';
        event.preventDefault();
      }
    });
  }

  /**
   * Simular un escaneo manual (para testing)
   */
  simulateScan(code: string): void {
    if (this.isCurrentlyListening) {
      this.scanSubject.next({
        code: code.trim(),
        timestamp: new Date()
      });
    }
  }
}
