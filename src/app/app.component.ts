import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './servicios/api.service';

// @ts-ignore
import * as bootstrap from 'bootstrap';

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

  productoAEliminar: any = null;

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

    console.log('Datos a enviar:', data); 

    if (this.editando && this.productoId !== null) {
      this.apiService.actualizarProducto(this.productoId, data).subscribe(() => {
        this.cancelar();
        this.cargarProductos();
      });
    } else {
      this.apiService.crearProducto(data).subscribe(() => {
        this.formulario = { title: '', image: '', price: null, description: '' };
        this.cargarProductos();
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
    this.productoAEliminar = producto;
    const modalElement = document.getElementById('modalEliminar');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmarEliminar() {
    if (this.productoAEliminar) {
      this.apiService.eliminarProducto(this.productoAEliminar.id).subscribe(() => {
        this.cargarProductos();

        // Cerrar el modal de confirmación
        const modalElement = document.getElementById('modalEliminar');
        if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement);
          modal?.hide();
        }

        // Abrir el modal de "Eliminado Correctamente"
        const modalEliminadoElement = document.getElementById('modalEliminadoCorrectamente');
        if (modalEliminadoElement) {
          const modal = new bootstrap.Modal(modalEliminadoElement);
          modal.show();
        }

        // Cerrar el modal de "Eliminado Correctamente" después de 3 segundos
        setTimeout(() => {
          const modalEliminado = bootstrap.Modal.getInstance(modalEliminadoElement);
          modalEliminado?.hide();
        }, 1000);

        this.productoAEliminar = null;
      });
    }
  }
}
