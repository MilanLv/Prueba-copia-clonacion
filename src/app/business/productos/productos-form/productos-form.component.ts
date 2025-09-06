import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { ProductosService } from '../../../shared/services/productos.service';
import { AuthService } from '../../../shared/services/auth.service';
import { Producto, ProductoCreate, ProductoUpdate } from '../../../shared/models/producto.model';

@Component({
  selector: 'app-productos-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ZXingScannerModule],
  templateUrl: './productos-form.component.html',
  styleUrl: './productos-form.component.css'
})
export class ProductosFormComponent implements OnInit {
  productoForm: FormGroup;
  producto: Producto | null = null;
  loading = false;
  error = '';
  isEdit = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  showScanner = false;
  scannedCode = '';
  allowedFormats = [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_39,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E
  ];

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

  toggleScanner(): void {
    this.showScanner = !this.showScanner;
  }

  onScanSuccess(result: string): void {
    this.scannedCode = result;
    this.productoForm.patchValue({ codigo_barras: result });
    this.showScanner = false;
  }

  onScanError(error: any): void {
    console.error('Error al escanear:', error);
    this.error = 'Error al escanear código de barras';
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
