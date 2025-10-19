import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Propietario, Mascota } from '../../models/api-models';
import { PropietarioService } from '../../services/propietario.service';
import { MascotaService } from '../../services/mascota.service';
import { RazaService, Raza } from '../../services/raza.service';

@Component({
  selector: 'app-propietario-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './propietario-detalle.component.html',
  styleUrls: ['./propietario-detalle.component.scss']
})
export class PropietarioDetalleComponent implements OnInit {

  propietario: Propietario | null = null;
  mascotaSeleccionada: Mascota | null = null;
  showPetModal = false;
  successMessage: string | null = null;

  razas: Raza[] = [];
  razasFiltradas: Raza[] = [];
  razaSearchTerm: string = ''; // Término de búsqueda para las razas
  mostrarInputNuevaRaza = false;
  nuevaRazaNombre = '';

  constructor(
    private route: ActivatedRoute,
    private propietarioService: PropietarioService,
    private mascotaService: MascotaService,
    private razaService: RazaService,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarPropietario(+id);
    }
    this.cargarRazas();
  }

  cargarRazas(): void {
    this.razaService.getRazas().subscribe(data => {
      this.razas = data.sort((a, b) => a.nombre.localeCompare(b.nombre));
      this.razasFiltradas = this.razas;
    });
  }

  // --- LÓGICA DE FILTRADO DE RAZAS ---
  filtrarRazas(): void {
    if (!this.razaSearchTerm) {
      this.razasFiltradas = this.razas;
    } else {
      const term = this.razaSearchTerm.toLowerCase();
      this.razasFiltradas = this.razas.filter(r => r.nombre.toLowerCase().includes(term));
    }
  }

  seleccionarRaza(razaNombre: string): void {
    if (razaNombre === 'otra') {
      this.mostrarInputNuevaRaza = true;
      this.razaSearchTerm = ''; // Limpia el campo de búsqueda
    } else {
      if (this.mascotaSeleccionada) {
        this.mascotaSeleccionada.raza = razaNombre;
      }
      this.razaSearchTerm = razaNombre; // Actualiza el input para mostrar la selección
      this.mostrarInputNuevaRaza = false;
    }
    // Opcional: podrías querer cerrar el dropdown aquí, pero el CSS ya lo maneja al perder el foco.
  }

  guardarNuevaRaza(): void {
    if (this.nuevaRazaNombre.trim() && this.mascotaSeleccionada) {
      this.razaService.createRaza({ nombre: this.nuevaRazaNombre }).subscribe(nuevaRaza => {
        this.cargarRazas();
        this.mascotaSeleccionada!.raza = nuevaRaza.nombre;
        this.razaSearchTerm = nuevaRaza.nombre; // Actualiza el input
        this.mostrarInputNuevaRaza = false;
        this.nuevaRazaNombre = '';
        this.cdr.markForCheck();
      });
    }
  }

  abrirModalMascota(mascota?: Mascota): void {
    this.mostrarInputNuevaRaza = false;
    this.nuevaRazaNombre = '';
    
    if (mascota) {
      this.mascotaSeleccionada = { ...mascota, propietarioId: this.propietario?.id };
      this.razaSearchTerm = mascota.raza; // Muestra la raza actual en el input
    } else {
      this.mascotaSeleccionada = { 
        id: 0, nombre: '', raza: '', fechaNacimiento: '', peso: 0, 
        sexo: 'MACHO', esterilizado: false,
        propietarioId: this.propietario?.id 
      };
      this.razaSearchTerm = ''; // Limpia el input para una nueva mascota
    }
    this.filtrarRazas(); // Asegura que la lista esté completa al abrir
    this.showPetModal = true;
  }
  
  guardarMascota(form: NgForm): void {
    if (form.invalid || !this.mascotaSeleccionada) return;

    // Aseguramos que la raza del input se asigne si el usuario no seleccionó de la lista
    if (this.razaSearchTerm && this.mascotaSeleccionada.raza !== this.razaSearchTerm) {
        this.mascotaSeleccionada.raza = this.razaSearchTerm;
    }

    const mascotaDto = {
      nombre: this.mascotaSeleccionada.nombre,
      raza: this.mascotaSeleccionada.raza,
      sexo: this.mascotaSeleccionada.sexo,
      esterilizado: this.mascotaSeleccionada.esterilizado,
      fechaNacimiento: this.mascotaSeleccionada.fechaNacimiento,
      peso: this.mascotaSeleccionada.peso,
      propietarioId: this.mascotaSeleccionada.propietarioId
    };

    if (this.mascotaSeleccionada.id > 0) {
      this.mascotaService.updateMascota(this.mascotaSeleccionada.id, mascotaDto).subscribe(() => {
        this.handlePetSuccess('Mascota actualizada correctamente.');
      });
    } else {
      this.mascotaService.createMascota(mascotaDto).subscribe(() => {
        this.handlePetSuccess('Mascota registrada correctamente.');
      });
    }
  }

  onRazaChange(event: any): void {
    if (event.target.value === 'otra') {
      this.mostrarInputNuevaRaza = true;
    } else {
      this.mostrarInputNuevaRaza = false;
      if (this.mascotaSeleccionada) {
        this.mascotaSeleccionada.raza = event.target.value;
      }
    }
  }

  cargarPropietario(id: number): void {
    this.propietarioService.getPropietarioPorId(id).subscribe(data => {
      this.propietario = data;
      this.cdr.markForCheck();
    });
  }

  guardarCambiosPropietario(): void {
    if (this.propietario) {
      this.propietarioService.updatePropietario(this.propietario.id, this.propietario).subscribe(() => {
        this.mostrarMensajeExito('Datos del propietario actualizados.');
      });
    }
  }

  cerrarModalMascota(): void {
    this.showPetModal = false;
    this.mascotaSeleccionada = null;
  }
  
  handlePetSuccess(message: string): void {
    if (this.propietario) {
      this.cargarPropietario(this.propietario.id);
    }
    this.cerrarModalMascota();
    this.mostrarMensajeExito(message);
  }

  calcularEdad(fechaNacimiento: string): string {
    if (!fechaNacimiento) return 'N/A';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    return edad > 0 ? `${edad} años` : 'Menos de 1 año';
  }

  regresar(): void {
    this.location.back();
  }
  
  mostrarMensajeExito(message: string): void {
    this.successMessage = message;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.successMessage = null;
      this.cdr.markForCheck();
    }, 3000);
  }
}

