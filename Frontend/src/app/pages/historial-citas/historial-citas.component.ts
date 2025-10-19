import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Cita, Usuario, Mascota } from '../../models/api-models';
import { CitaService } from '../../services/cita.service';
import { UsuarioService } from '../../services/usuario.service';
import { MascotaService } from '../../services/mascota.service';
import { parseISO, isWithinInterval } from 'date-fns';

@Component({
  selector: 'app-historial-citas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-citas.component.html',
  styleUrls: ['./historial-citas.component.scss']
})
export class HistorialCitasComponent implements OnInit {

  todasLasCitas: Cita[] = [];
  citasFiltradas: Cita[] = [];
  
  showDetailModal = false;
  showEditModal = false;
  showCancelModal = false;

  citaDetalle: Cita | null = null;
  citaParaEdicion: Cita | null = null;
  citaParaCancelar: Cita | null = null;
  
  filtroEstado: string = 'TODAS';
  filtroTexto: string = '';
  filtroFechaDesde: string = '';
  filtroFechaHasta: string = '';
  
  profesionales: Usuario[] = [];
  mascotas: Mascota[] = [];

  constructor(
    private citaService: CitaService,
    private usuarioService: UsuarioService,
    private mascotaService: MascotaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarCitas();
    this.cargarDatosParaModal();
  }

  cargarCitas(): void {
    this.citaService.getCitas().subscribe(data => {
      this.todasLasCitas = data.sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime());
      this.aplicarFiltros();
      this.cdr.markForCheck();
    });
  }
  
  cargarDatosParaModal(): void {
    this.usuarioService.getVeterinarios().subscribe(data => this.profesionales.push(...data));
    this.usuarioService.getGroomers().subscribe(data => this.profesionales.push(...data));
    this.mascotaService.getMascotas().subscribe(data => this.mascotas = data);
  }

  // Lógica de Modales
  verDetalle(cita: Cita): void {
    this.citaDetalle = cita;
    this.showDetailModal = true;
  }

  abrirModalEdicion(cita: Cita): void {
    this.citaParaEdicion = { ...cita };
    this.citaParaEdicion.fechaHora = this.formatDateForInput(this.citaParaEdicion.fechaHora);
    this.showEditModal = true;
  }

  abrirModalCancelacion(cita: Cita): void {
    this.citaParaCancelar = cita;
    this.showCancelModal = true;
  }

  cerrarModales(): void {
    this.showDetailModal = false;
    this.showEditModal = false;
    this.showCancelModal = false;
    this.citaDetalle = null;
    this.citaParaEdicion = null;
    this.citaParaCancelar = null;
  }

  // Lógica de Acciones
  guardarCambios(form: NgForm): void {
    if (form.invalid || !this.citaParaEdicion) return;

    const citaDto = {
      mascotaId: this.citaParaEdicion.mascota.id,
      asignadoAId: this.citaParaEdicion.asignadoA.id,
      fechaHora: new Date(this.citaParaEdicion.fechaHora).toISOString(),
      motivo: this.citaParaEdicion.motivo,
      area: this.citaParaEdicion.area,
      estado: this.citaParaEdicion.estado,
    };

    this.citaService.updateCita(this.citaParaEdicion.id, citaDto).subscribe(() => {
      this.cargarCitas();
      this.cerrarModales();
    });
  }
  
  confirmarCancelacion(): void {
    if (!this.citaParaCancelar) return;

    this.citaService.updateEstadoCita(this.citaParaCancelar.id, 'CANCELADA').subscribe(() => {
      this.cargarCitas();
      this.cerrarModales();
    });
  }

  // Lógica de Filtros
  aplicarFiltros(): void {
    let citasTemp = this.todasLasCitas;

    if (this.filtroEstado !== 'TODAS') {
      citasTemp = citasTemp.filter(cita => cita.estado === this.filtroEstado);
    }

    if (this.filtroTexto.trim() !== '') {
      const textoBusqueda = this.filtroTexto.toLowerCase();
      citasTemp = citasTemp.filter(cita => 
        cita.mascota.propietario?.nombre.toLowerCase().includes(textoBusqueda) ||
        cita.mascota.propietario?.apellido.toLowerCase().includes(textoBusqueda) ||
        cita.mascota.propietario?.dni.toLowerCase().includes(textoBusqueda)
      );
    }
    
    if (this.filtroFechaDesde && this.filtroFechaHasta) {
      const desde = parseISO(this.filtroFechaDesde);
      const hasta = new Date(parseISO(this.filtroFechaHasta).getTime() + (24 * 60 * 60 * 1000 - 1));
      citasTemp = citasTemp.filter(cita => isWithinInterval(parseISO(cita.fechaHora), { start: desde, end: hasta }));
    }
    
    this.citasFiltradas = citasTemp;
    this.cdr.markForCheck();
  }

  limpiarFiltros(): void {
    this.filtroEstado = 'TODAS';
    this.filtroTexto = '';
    this.filtroFechaDesde = '';
    this.filtroFechaHasta = '';
    this.aplicarFiltros();
  }
  
  private formatDateForInput(dateStr: string): string {
    const date = new Date(dateStr);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  }
}

