import { Component, Input, OnInit, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-barcode-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="barcode-container">
      <canvas #barcodeCanvas class="max-w-full h-auto"></canvas>
      <p *ngIf="showText" class="text-center text-sm text-gray-600 mt-2 font-mono">{{ code }}</p>
    </div>
  `,
  styles: [`
    .barcode-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  `]
})
export class BarcodeDisplayComponent implements OnInit, OnChanges {
  @Input() code: string = '';
  @Input() format: string = 'CODE128';
  @Input() width: number = 2;
  @Input() height: number = 100;
  @Input() displayValue: boolean = true;
  @Input() showText: boolean = true;
  @Input() fontSize: number = 14;
  @Input() textMargin: number = 2;
  @Input() background: string = '#ffffff';
  @Input() lineColor: string = '#000000';

  @ViewChild('barcodeCanvas', { static: true }) barcodeCanvas!: ElementRef<HTMLCanvasElement>;

  ngOnInit(): void {
    this.generateBarcode();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['code'] || changes['format'] || changes['width'] || changes['height']) {
      this.generateBarcode();
    }
  }

  generateBarcode(): void {
    if (!this.code || !this.barcodeCanvas) {
      return;
    }

    try {
      JsBarcode(this.barcodeCanvas.nativeElement, this.code, {
        format: this.format,
        width: this.width,
        height: this.height,
        displayValue: this.displayValue,
        fontSize: this.fontSize,
        textMargin: this.textMargin,
        background: this.background,
        lineColor: this.lineColor,
        margin: 10
      });
    } catch (error) {
      console.error('Error generando código de barras:', error);
    }
  }
}
