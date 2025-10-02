import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExcelService, ExcelImportResult } from '../../services/excel.service';
import { Producto } from '../../models/producto.model';

@Component({
  selector: 'app-excel-import-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './excel-import-modal.component.html',
  styleUrl: './excel-import-modal.component.css'
})
export class ExcelImportModalComponent {
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() importCompleted = new EventEmitter<ExcelImportResult>();

  selectedFile: File | null = null;
  isProcessing = false;
  importResult: ExcelImportResult | null = null;
  showPreview = false;
  dragOver = false;

  // Mensajes de error
  fileError = '';
  maxFileSizeMB = 10;

  constructor(private excelService: ExcelService) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.handleFileSelection(file);
  }

  onFileDropped(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
  }

  private handleFileSelection(file: File): void {
    this.fileError = '';
    this.selectedFile = null;
    this.importResult = null;

    if (!file) {
      return;
    }

    // Validar tipo de archivo
    if (!this.excelService.validateFileType(file)) {
      this.fileError = 'Tipo de archivo no válido. Solo se permiten archivos Excel (.xlsx, .xls) y CSV.';
      return;
    }

    // Validar tamaño
    if (!this.excelService.validateFileSize(file, this.maxFileSizeMB)) {
      this.fileError = `El archivo es demasiado grande. Máximo permitido: ${this.maxFileSizeMB}MB.`;
      return;
    }

    this.selectedFile = file;
  }

  async processFile(): Promise<void> {
    if (!this.selectedFile) {
      this.fileError = 'Por favor selecciona un archivo';
      return;
    }

    this.isProcessing = true;
    this.fileError = '';

    try {
      this.importResult = await this.excelService.importProductsFromExcel(this.selectedFile);
      this.showPreview = true;
    } catch (error) {
      this.fileError = 'Error al procesar el archivo: ' + (error as Error).message;
      console.error('Error al importar:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  confirmImport(): void {
    if (this.importResult && this.importResult.success) {
      this.importCompleted.emit(this.importResult);
      this.closeModal();
    }
  }

  downloadTemplate(): void {
    this.excelService.exportTemplateToExcel();
  }

  closeModal(): void {
    this.isOpen = false;
    this.isOpenChange.emit(false);
    this.resetModal();
  }

  private resetModal(): void {
    this.selectedFile = null;
    this.isProcessing = false;
    this.importResult = null;
    this.showPreview = false;
    this.fileError = '';
    this.dragOver = false;
  }

  getFileIcon(fileName: string): string {
    if (fileName.toLowerCase().endsWith('.xlsx')) {
      return 'fas fa-file-excel text-green-600';
    } else if (fileName.toLowerCase().endsWith('.xls')) {
      return 'fas fa-file-excel text-green-500';
    } else if (fileName.toLowerCase().endsWith('.csv')) {
      return 'fas fa-file-csv text-blue-600';
    }
    return 'fas fa-file text-gray-500';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getStatusIcon(result: ExcelImportResult): string {
    if (result.success) {
      return 'fas fa-check-circle text-green-500';
    } else {
      return 'fas fa-exclamation-triangle text-yellow-500';
    }
  }

  getStatusMessage(result: ExcelImportResult): string {
    if (result.success) {
      return `Importación exitosa: ${result.validRows} productos válidos de ${result.totalRows} filas`;
    } else {
      return `Importación con errores: ${result.validRows} productos válidos de ${result.totalRows} filas`;
    }
  }
}
