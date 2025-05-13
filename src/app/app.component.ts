import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './servicios/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private apiService = inject(ApiService);

  productos: any[] = [];
  formulario = { title: '', image: '', price: null, description: '' };
  editando = false;
  productoId: number | null = null;

  constructor() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.apiService.obtenerProductos().subscribe(res => {
      this.productos = res.slice(0, 12); // mostrar 12 productos máximo
    });
  }

  guardar() {
    const data = {
      title: this.formulario.title,
      price: this.formulario.price,
      images: [this.formulario.image],
      categoryId: 1,
    };

    if (this.editando && this.productoId !== null) {
      this.apiService.actualizarProducto(this.productoId, data).subscribe(() => {
        this.cancelar();
        this.cargarProductos();
        Swal.fire({
          icon: 'success',
          title: 'Producto actualizado',
          text: 'El producto fue actualizado correctamente',
          timer: 1500,
          showConfirmButton: false
        });
      });
    } else {
      this.apiService.crearProducto(data).subscribe(() => {
        this.formulario = { title: '', image: '', price: null, description: '' };
        this.cargarProductos();
        Swal.fire({
          icon: 'success',
          title: 'Producto creado',
          text: 'El producto fue creado correctamente',
          timer: 1500,
          showConfirmButton: false
        });
      });
    }
  }

  editar(producto: any) {
    this.editando = true;
    this.productoId = producto.id;
    this.formulario = {
      title: producto.title,
      image: producto.images[0],
      price: producto.price,
      description: producto.description
    };
  }

  cancelar() {
    this.editando = false;
    this.productoId = null;
    this.formulario = { title: '', image: '', price: null, description: '' };
  }

  abrirModalEliminar(producto: any) {
    Swal.fire({
      title: `¿Eliminar "${producto.title}"?`,
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.eliminarProducto(producto.id).subscribe(() => {
          this.cargarProductos();
          Swal.fire({
            icon: 'success',
            title: 'Producto eliminado',
            text: 'El producto fue eliminado correctamente',
            timer: 1500,
            showConfirmButton: false
          });
        });
      }
    });
  }
}
