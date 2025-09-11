import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BarcodeScannerService } from '../services/barcode-scanner.service';

@Component({
  selector: 'app-barcode-scanner-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <i class="fas fa-flask text-blue-600"></i>
        Pruebas de Escáner
      </h3>
      
      <div class="space-y-4">
        <!-- Input para simular código -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Simular Código de Barras
          </label>
          <div class="flex gap-2">
            <input
              type="text"
              [(ngModel)]="codigoTest"
              placeholder="Ingresa un código para simular..."
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              (keydown.enter)="simularEscaneo()">
            <button
              (click)="simularEscaneo()"
              [disabled]="!codigoTest || !isScanning"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
              <i class="fas fa-play"></i>
              Simular
            </button>
          </div>
        </div>
        
        <!-- Códigos de ejemplo -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Códigos de Ejemplo
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button
              *ngFor="let codigo of codigosEjemplo"
              (click)="usarCodigoEjemplo(codigo)"
              [disabled]="!isScanning"
              class="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed">
              {{ codigo }}
            </button>
          </div>
        </div>
        
        <!-- Estado del escáner -->
        <div class="pt-3 border-t border-gray-200">
          <div class="flex items-center gap-2 text-sm">
            <div [class]="isScanning ? 'w-2 h-2 bg-green-500 rounded-full' : 'w-2 h-2 bg-red-500 rounded-full'"></div>
            <span [class]="isScanning ? 'text-green-600' : 'text-red-600'">
              {{ isScanning ? 'Escáner activo' : 'Escáner inactivo' }}
            </span>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            {{ isScanning ? 'Puedes simular escaneos o usar un escáner físico' : 'Activa el escáner primero en cotizaciones o ventas' }}
          </p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class BarcodeScannerTestComponent {
  codigoTest = '';
  isScanning = false;
  
  codigosEjemplo = [
    '7501234567890',
    '1234567890123',
    'PROD001',
    'ABC123',
    '9876543210987',
    'TEST001'
  ];

  constructor(private barcodeScannerService: BarcodeScannerService) {
    // Suscribirse al estado del escáner
    this.barcodeScannerService.isListening$.subscribe(
      (isListening: boolean) => {
        this.isScanning = isListening;
      }
    );
  }

  simularEscaneo(): void {
    if (this.codigoTest.trim() && this.isScanning) {
      this.barcodeScannerService.simulateScan(this.codigoTest.trim());
      this.codigoTest = '';
    }
  }

  usarCodigoEjemplo(codigo: string): void {
    this.codigoTest = codigo;
    this.simularEscaneo();
  }
}
