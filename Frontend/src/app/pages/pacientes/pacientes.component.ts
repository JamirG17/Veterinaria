import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Propietario } from '../../models/api-models';
import { PropietarioService } from '../../services/propietario.service';
import { MascotaService } from '../../services/mascota.service'; // Aunque no se usa aquí, lo mantenemos por si acaso

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.scss']
})
export class PacientesComponent implements OnInit {

  propietarios: Propietario[] = [];
  propietariosFiltrados: Propietario[] = [];
  
  showOwnerModal = false;
  // Usaremos un objeto específico para el nuevo propietario para mayor claridad
  nuevoPropietario: Propietario = this.inicializarPropietario();
  
  successMessage: string | null = null;
  searchTerm: string = '';

  constructor(
    private propietarioService: PropietarioService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPropietarios();
  }

  cargarPropietarios(): void {
    this.propietarioService.getPropietarios().subscribe(data => {
      this.propietarios = data;
      this.propietariosFiltrados = data;
      this.cdr.markForCheck();
    });
  }

  filtrarPropietarios(): void {
    const term = this.searchTerm.toLowerCase();
    this.propietariosFiltrados = this.propietarios.filter(p => 
      p.nombre.toLowerCase().includes(term) || 
      p.apellido.toLowerCase().includes(term) ||
      (p.dni && p.dni.toLowerCase().includes(term)) ||
      p.email.toLowerCase().includes(term)
    );
  }

  // Lógica simplificada para abrir el modal de CREACIÓN
  abrirModalPropietario(): void {
    this.nuevoPropietario = this.inicializarPropietario(); // Resetea el formulario
    this.showOwnerModal = true;
  }

  cerrarModal(): void {
    this.showOwnerModal = false;
  }

  guardarPropietario(form: NgForm): void {
    if (form.invalid) return;

    this.propietarioService.createPropietario(this.nuevoPropietario)
      .subscribe(() => {
        this.cargarPropietarios();
        this.mostrarMensajeExito('Propietario registrado correctamente.');
        this.cerrarModal();
      });
  }

  verDetalle(propietarioId: number): void {
    this.router.navigate(['/pacientes', propietarioId]);
  }
  
  mostrarMensajeExito(message: string): void {
    this.successMessage = message;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.successMessage = null;
      this.cdr.markForCheck();
    }, 3000);
  }

  private inicializarPropietario(): Propietario {
    return { id: 0, nombre: '', apellido: '', dni: '', telefono: '', email: '', mascotas: [] };
  }
}

