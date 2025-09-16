import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import ApexCharts from 'apexcharts';
import { VentasService } from '../../shared/services/ventas.service';
import { CotizacionesService } from '../../shared/services/cotizaciones.service';
import { ProductosService } from '../../shared/services/productos.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export default class DashboardComponent implements OnInit, AfterViewInit {
  
  // Referencias a los contenedores de gráficas
  @ViewChild('ventasChart', { static: false }) ventasChart!: ElementRef;
  @ViewChild('productosChart', { static: false }) productosChart!: ElementRef;
  @ViewChild('tendenciasChart', { static: false }) tendenciasChart!: ElementRef;
  @ViewChild('metricasChart', { static: false }) metricasChart!: ElementRef;

  // Servicios
  constructor(
    private ventasService: VentasService,
    private cotizacionesService: CotizacionesService,
    private productosService: ProductosService
  ) {}

  // Datos del dashboard
  metricas = {
    ventasHoy: 0,
    ventasAyer: 0,
    productosVendidos: 0,
    clientesNuevos: 0,
    ticketPromedio: 0,
    crecimientoVentas: 0,
    crecimientoProductos: 0,
    crecimientoClientes: 0
  };

  // Estadísticas reales
  estadisticasVentas: any = null;
  estadisticasCotizaciones: any = null;
  estadisticasProductos: any = null;
  cargandoDatos = true;

  // Datos de ventas por mes (últimos 6 meses)
  datosVentas = [
    { mes: 'Ene', ventas: 45000, productos: 120 },
    { mes: 'Feb', ventas: 52000, productos: 135 },
    { mes: 'Mar', ventas: 48000, productos: 128 },
    { mes: 'Abr', ventas: 61000, productos: 145 },
    { mes: 'May', ventas: 58000, productos: 142 },
    { mes: 'Jun', ventas: 67000, productos: 156 }
  ];

  // Productos más vendidos
  productosTop = [
    { nombre: 'Laptop HP Pavilion', vendidos: 45, ingresos: 225000 },
    { nombre: 'Mouse Logitech', vendidos: 78, ingresos: 15600 },
    { nombre: 'Teclado Mecánico', vendidos: 32, ingresos: 9600 },
    { nombre: 'Monitor Samsung', vendidos: 28, ingresos: 84000 },
    { nombre: 'Auriculares Sony', vendidos: 56, ingresos: 16800 }
  ];

  // Datos de tendencias diarias (últimos 7 días)
  tendenciasDiarias = [
    { dia: 'Lun', ventas: 8500, clientes: 12 },
    { dia: 'Mar', ventas: 9200, clientes: 15 },
    { dia: 'Mié', ventas: 7800, clientes: 11 },
    { dia: 'Jue', ventas: 10500, clientes: 18 },
    { dia: 'Vie', ventas: 12800, clientes: 22 },
    { dia: 'Sáb', ventas: 15200, clientes: 25 },
    { dia: 'Dom', ventas: 9800, clientes: 16 }
  ];

  // Fecha de última actualización
  fechaActualizacion = new Date().toLocaleString('es-ES');

  ngOnInit() {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.cargandoDatos = true;
    
    // Cargar estadísticas de ventas
    this.ventasService.getStats().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.estadisticasVentas = response.data;
          this.actualizarMetricas();
        }
      },
      error: (error: any) => {
        console.error('Error al cargar estadísticas de ventas:', error);
      }
    });

    // Cargar estadísticas de cotizaciones
    this.cotizacionesService.getStats().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.estadisticasCotizaciones = response.data;
          this.actualizarMetricas();
        }
      },
      error: (error: any) => {
        console.error('Error al cargar estadísticas de cotizaciones:', error);
      }
    });

    // Cargar estadísticas de productos
    this.productosService.getStats().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.estadisticasProductos = response.data;
          this.actualizarMetricas();
        }
      },
      error: (error: any) => {
        console.error('Error al cargar estadísticas de productos:', error);
      }
    });
  }

  actualizarMetricas() {
    if (this.estadisticasVentas && this.estadisticasCotizaciones && this.estadisticasProductos) {
      this.metricas = {
        ventasHoy: this.estadisticasVentas.ventas_hoy || 0,
        ventasAyer: this.estadisticasVentas.ventas_ayer || 0,
        productosVendidos: this.estadisticasVentas.total_ventas || 0,
        clientesNuevos: this.estadisticasVentas.clientes_nuevos || 0,
        ticketPromedio: this.estadisticasVentas.ticket_promedio || 0,
        crecimientoVentas: this.calcularCrecimiento(this.estadisticasVentas.ventas_hoy, this.estadisticasVentas.ventas_ayer),
        crecimientoProductos: this.calcularCrecimiento(this.estadisticasProductos.con_stock, this.estadisticasProductos.stock_bajo),
        crecimientoClientes: this.calcularCrecimiento(this.estadisticasVentas.clientes_nuevos, 0)
      };
      this.cargandoDatos = false;
    }
  }

  calcularCrecimiento(actual: number, anterior: number): number {
    if (anterior === 0) return actual > 0 ? 100 : 0;
    return ((actual - anterior) / anterior) * 100;
  }

  ngAfterViewInit() {
    // Esperar un poco para que los elementos estén completamente renderizados
    setTimeout(() => {
      this.inicializarGraficas();
    }, 100);
  }

  inicializarGraficas() {
    this.crearGraficaVentas();
    this.crearGraficaProductos();
    this.crearGraficaTendencias();
    this.crearGraficaMetricas();
  }

  crearGraficaVentas() {
    const options = {
      series: [{
        name: 'Ventas',
        data: this.datosVentas.map(d => d.ventas)
      }],
      chart: {
        type: 'area',
        height: 350,
        toolbar: {
          show: false
        }
      },
      colors: ['#3B82F6'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3,
          stops: [0, 90, 100]
        }
      },
      xaxis: {
        categories: this.datosVentas.map(d => d.mes),
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      yaxis: {
        labels: {
          formatter: function (value: number) {
            return '$' + (value / 1000) + 'k';
          }
        }
      },
      grid: {
        borderColor: '#f1f5f9',
        strokeDashArray: 5
      },
      tooltip: {
        y: {
          formatter: function (value: number) {
            return '$' + value.toLocaleString();
          }
        }
      }
    };

    const chart = new ApexCharts(this.ventasChart.nativeElement, options);
    chart.render();
  }

  crearGraficaProductos() {
    const options = {
      series: this.productosTop.map(p => p.vendidos),
      chart: {
        type: 'donut',
        height: 350
      },
      labels: this.productosTop.map(p => p.nombre),
      colors: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'],
      dataLabels: {
        enabled: true,
        formatter: function (val: number) {
          return val + '%';
        }
      },
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total Vendidos',
                formatter: () => {
                  return this.productosTop.reduce((sum: number, p: any) => sum + p.vendidos, 0).toString();
                }
              }
            }
          }
        }
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center'
      },
      tooltip: {
        y: {
          formatter: (value: number, { seriesIndex }: any) => {
            const producto = this.productosTop[seriesIndex];
            return `${value} unidades - $${producto.ingresos.toLocaleString()}`;
          }
        }
      }
    };

    const chart = new ApexCharts(this.productosChart.nativeElement, options);
    chart.render();
  }

  crearGraficaTendencias() {
    const options = {
      series: [
        {
          name: 'Ventas',
          type: 'column',
          data: this.tendenciasDiarias.map(d => d.ventas)
        },
        {
          name: 'Clientes',
          type: 'line',
          data: this.tendenciasDiarias.map(d => d.clientes)
        }
      ],
      chart: {
        height: 350,
        type: 'line',
        toolbar: {
          show: false
        }
      },
      colors: ['#3B82F6', '#10B981'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: [0, 3],
        curve: 'smooth'
      },
      xaxis: {
        categories: this.tendenciasDiarias.map(d => d.dia)
      },
      yaxis: [
        {
          title: {
            text: 'Ventas ($)'
          },
          labels: {
            formatter: function (value: number) {
              return '$' + (value / 1000) + 'k';
            }
          }
        },
        {
          opposite: true,
          title: {
            text: 'Clientes'
          }
        }
      ],
      tooltip: {
        shared: true,
        intersect: false,
        y: [
          {
            formatter: function (value: number) {
              return '$' + value.toLocaleString();
            }
          },
          {
            formatter: function (value: number) {
              return value + ' clientes';
            }
          }
        ]
      },
      legend: {
        position: 'top'
      }
    };

    const chart = new ApexCharts(this.tendenciasChart.nativeElement, options);
    chart.render();
  }

  crearGraficaMetricas() {
    const options = {
      series: [{
        name: 'Crecimiento',
        data: [27.1, 12.5, 8.3, 15.2]
      }],
      chart: {
        type: 'radialBar',
        height: 350
      },
      colors: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'],
      plotOptions: {
        radialBar: {
          dataLabels: {
            name: {
              fontSize: '22px',
            },
            value: {
              fontSize: '16px',
              formatter: function (val: number) {
                return val + '%';
              }
            },
            total: {
              show: true,
              label: 'Promedio',
              formatter: function () {
                return '18.3%';
              }
            }
          }
        }
      },
      labels: ['Ventas', 'Productos', 'Clientes', 'Ingresos']
    };

    const chart = new ApexCharts(this.metricasChart.nativeElement, options);
    chart.render();
  }

  formatearPrecio(valor: number): string {
    return '$' + valor.toLocaleString('es-ES');
  }

  obtenerPorcentajeCrecimiento(actual: number, anterior: number): number {
    return ((actual - anterior) / anterior) * 100;
  }
}
