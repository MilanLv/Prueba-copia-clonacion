import { Injectable } from '@angular/core';

declare var pdfMake: any;
declare var pdfFonts: any;

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() {
    // Configurar pdfMake cuando el servicio se inicializa
    if (typeof pdfMake !== 'undefined' && typeof pdfFonts !== 'undefined') {
      pdfMake.vfs = pdfFonts.pdfMake.vfs;
    }
  }

  generateProductReport(products: any[]): void {
    if (products.length === 0) {
      alert('No hay productos para generar el reporte');
      return;
    }

    // Verificar que pdfMake esté disponible
    if (typeof pdfMake === 'undefined') {
      alert('Error: pdfMake no está disponible. Por favor recarga la página.');
      return;
    }

    const docDefinition = {
      content: [
        {
          text: 'Reporte de Productos',
          style: 'header',
          alignment: 'center'
        },
        {
          text: `Fecha: ${new Date().toLocaleDateString('es-ES')}`,
          style: 'subheader',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        {
          text: `Total de productos seleccionados: ${products.length}`,
          style: 'info',
          margin: [0, 0, 0, 20]
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Descripción', style: 'tableHeader' },
                { text: 'Código', style: 'tableHeader' },
                { text: 'Precio', style: 'tableHeader' },
                { text: 'Stock', style: 'tableHeader' },
                { text: 'Estado', style: 'tableHeader' }
              ],
              ...products.map(producto => [
                producto.descripcion || 'Sin descripción',
                producto.cod || 'Sin código',
                `$${(Number(producto.precio) || 0).toFixed(2)}`,
                (Number(producto.cantidad) || 0).toString(),
                producto.estado_stock || 'Sin estado'
              ])
            ]
          },
          layout: 'lightHorizontalLines'
        },
        {
          text: `\n\nValor total del inventario seleccionado: $${products.reduce((total, producto) => {
            const precio = Number(producto.precio) || 0;
            const cantidad = Number(producto.cantidad) || 0;
            return total + (precio * cantidad);
          }, 0).toFixed(2)}`,
          style: 'footer',
          alignment: 'right'
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          color: '#1f2937'
        },
        subheader: {
          fontSize: 12,
          color: '#6b7280'
        },
        info: {
          fontSize: 10,
          color: '#374151'
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: '#ffffff',
          fillColor: '#3b82f6'
        },
        footer: {
          fontSize: 10,
          bold: true,
          color: '#1f2937'
        }
      },
      pageMargins: [40, 60, 40, 60]
    };

    pdfMake.createPdf(docDefinition).download(`productos_${new Date().toISOString().split('T')[0]}.pdf`);
  }
}
