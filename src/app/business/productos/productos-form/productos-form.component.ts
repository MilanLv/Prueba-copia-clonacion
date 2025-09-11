import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductosService } from '../../../shared/services/productos.service';
import { AuthService } from '../../../shared/services/auth.service';
import { Producto, ProductoCreate, ProductoUpdate } from '../../../shared/models/producto.model';

@Component({
  selector: 'app-productos-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './productos-form.component.html',
  styleUrl: './productos-form.component.css'
})
export class ProductosFormComponent implements OnInit {
  @ViewChild('barcodeInput', { static: false }) barcodeInput!: ElementRef<HTMLInputElement>;
  
  productoForm: FormGroup;
  producto: Producto | null = null;
  loading = false;
  error = '';
  isEdit = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  showScannerInstructions = false;
  scannedCode = '';
  scannerReady = false;
  private scanBuffer = '';
  private scanTimeout: any;

  constructor(
    private fb: FormBuilder,
    private productosService: ProductosService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.productoForm = this.fb.group({
      cod: [''],
      codigo_barras: [''],
      descripcion: ['', [Validators.required, Validators.minLength(3)]],
      precio: [0, [Validators.required, Validators.min(0)]],
      cantidad: [0, [Validators.min(0)]],
      imagen: ['']
    });
  }

  ngOnInit(): void {
    this.checkUserRole();
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.loadProducto(id);
      }
    });
  }

  checkUserRole(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        if (user.rol_nombre?.toLowerCase() !== 'administrador') {
          this.error = 'No tienes permisos para acceder a esta sección. Se requiere rol de Administrador.';
        }
      }
    });
  }

  loadProducto(id: number): void {
    this.loading = true;
    this.productosService.getById(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.producto = response.data;
          this.populateForm();
          if (this.producto?.imagen) {
            this.imagePreview = this.productosService.getImage(this.producto.imagen);
          }
        } else {
          this.error = response.message;
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar producto';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  populateForm(): void {
    if (this.producto) {
      this.productoForm.patchValue({
        cod: this.producto.cod || '',
        codigo_barras: this.producto.codigo_barras || '',
        descripcion: this.producto.descripcion,
        precio: this.producto.precio,
        cantidad: this.producto.cantidad
      });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.productoForm.patchValue({ imagen: '' });
  }

  toggleScannerInstructions(): void {
    this.showScannerInstructions = !this.showScannerInstructions;
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Solo procesar si el escáner está listo y estamos en el campo de código de barras
    if (!this.scannerReady || !this.barcodeInput?.nativeElement.contains(document.activeElement)) {
      return;
    }

    // Ignorar teclas especiales como Enter, Tab, etc.
    if (event.key === 'Enter') {
      event.preventDefault();
      this.processScannedCode();
      return;
    }

    // Acumular caracteres en el buffer
    if (event.key.length === 1) {
      this.scanBuffer += event.key;
      
      // Limpiar timeout anterior
      if (this.scanTimeout) {
        clearTimeout(this.scanTimeout);
      }
      
      // Establecer nuevo timeout para procesar el código completo
      this.scanTimeout = setTimeout(() => {
        this.processScannedCode();
      }, 100);
    }
  }

  private processScannedCode(): void {
    if (this.scanBuffer.length > 0) {
      this.scannedCode = this.scanBuffer;
      this.productoForm.patchValue({ codigo_barras: this.scanBuffer });
      this.scanBuffer = '';
      this.scannerReady = false;
      this.showScannerInstructions = false;
      
      // Validar el código escaneado
      this.validateBarcode();
    }
  }

  enableScanner(): void {
    this.scannerReady = true;
    this.showScannerInstructions = true;
    this.scanBuffer = '';
    
    // Enfocar el campo de código de barras
    setTimeout(() => {
      if (this.barcodeInput) {
        this.barcodeInput.nativeElement.focus();
      }
    }, 100);
  }

  disableScanner(): void {
    this.scannerReady = false;
    this.showScannerInstructions = false;
    this.scanBuffer = '';
  }

  generateBarcode(): void {
    if (this.productoForm.get('codigo_barras')?.value) {
      // Ya tiene código de barras
      return;
    }

    if (this.isEdit && this.producto) {
      this.productosService.generateBarcode(this.producto.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.productoForm.patchValue({ 
              codigo_barras: response.data.codigo_generado 
            });
          } else {
            this.error = response.message;
          }
        },
        error: (error) => {
          this.error = 'Error al generar código de barras';
          console.error('Error:', error);
        }
      });
    }
  }

  validateBarcode(): void {
    const codigoBarras = this.productoForm.get('codigo_barras')?.value;
    if (codigoBarras) {
      this.productosService.validateBarcode({ codigo_barras: codigoBarras }).subscribe({
        next: (response) => {
          if (response.success) {
            if (!response.data.valido) {
              this.error = `Código de barras inválido: ${response.data.mensaje}`;
            }
          }
        },
        error: (error) => {
          console.error('Error al validar código de barras:', error);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.productoForm.valid) {
      this.loading = true;
      this.error = '';

      const formData = this.productoForm.value;
      
      if (this.isEdit && this.producto) {
        // Actualizar producto
        this.productosService.update(this.producto.id, formData, this.selectedFile || undefined).subscribe({
          next: (response) => {
            if (response.success) {
              this.router.navigate(['/productos']);
            } else {
              this.error = response.message;
            }
            this.loading = false;
          },
          error: (error) => {
            this.error = 'Error al actualizar producto';
            this.loading = false;
            console.error('Error:', error);
          }
        });
      } else {
        // Crear producto
        this.productosService.create(formData, this.selectedFile || undefined).subscribe({
          next: (response) => {
            if (response.success) {
              this.router.navigate(['/productos']);
            } else {
              this.error = response.message;
            }
            this.loading = false;
          },
          error: (error) => {
            this.error = 'Error al crear producto';
            this.loading = false;
            console.error('Error:', error);
          }
        });
      }
    } else {
      this.error = 'Por favor, completa todos los campos requeridos correctamente';
    }
  }

  onCancel(): void {
    this.router.navigate(['/productos']);
  }

  // Getters para validación de formulario
  get descripcion() { return this.productoForm.get('descripcion'); }
  get precio() { return this.productoForm.get('precio'); }
  get cantidad() { return this.productoForm.get('cantidad'); }
  get codigo_barras() { return this.productoForm.get('codigo_barras'); }
}
