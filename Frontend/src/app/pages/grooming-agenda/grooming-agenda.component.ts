import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cita } from '../../models/api-models';
import { CitaService } from '../../services/cita.service';

@Component({
  selector: 'app-grooming-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grooming-agenda.component.html',
  styleUrls: ['./grooming-agenda.component.scss']
})
export class GroomingAgendaComponent implements OnInit {

  citasDeHoy: Cita[] = [];
  
  showDetailModal = false;
  showFinishModal = false;

  citaSeleccionada: Cita | null = null;
  historialGrooming: Cita[] = [];
  notasNuevas: string = '';

  constructor(
    private citaService: CitaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarAgenda();
  }

  cargarAgenda(): void {
    this.citaService.getAgendaGroomerHoy().subscribe(data => {
      this.citasDeHoy = data.sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());
      this.cdr.markForCheck();
    });
  }

  cambiarEstado(cita: Cita, nuevoEstado: string, event: MouseEvent): void {
    event.stopPropagation();
    if (nuevoEstado === 'COMPLETADA') {
      this.abrirModalFinalizacion(cita);
    } else {
      this.citaService.updateEstadoCita(cita.id, nuevoEstado).subscribe(() => {
        this.cargarAgenda();
      });
    }
  }

  abrirModalFinalizacion(cita: Cita): void {
    this.citaSeleccionada = cita;
    this.notasNuevas = cita.notasGrooming || '';
    this.showFinishModal = true;
    this.cdr.markForCheck(); // --- FORZAMOS LA DETECCIÓN DE CAMBIOS ---
  }

  confirmarFinalizacion(cancelar: boolean = false): void {
    if (!this.citaSeleccionada) return;

    const estadoFinal = cancelar ? 'CANCELADA' : 'COMPLETADA';

    // Guardamos las notas primero
    this.citaService.guardarNotasGrooming(this.citaSeleccionada.id, this.notasNuevas).subscribe(() => {
      // Luego, actualizamos el estado
      this.citaService.updateEstadoCita(this.citaSeleccionada!.id, estadoFinal).subscribe(() => {
        this.cargarAgenda();
        this.cerrarModal();
      });
    });
  }

  verDetalle(cita: Cita): void {
    this.citaSeleccionada = cita;
    this.notasNuevas = cita.notasGrooming || '';
    this.citaService.getHistorialGrooming(cita.mascota.id).subscribe(historial => {
      this.historialGrooming = historial;
      this.showDetailModal = true;
      this.cdr.markForCheck();
    });
  }

  cerrarModal(): void {
    this.showDetailModal = false;
    this.showFinishModal = false;
    this.citaSeleccionada = null;
    this.historialGrooming = [];
    this.notasNuevas = '';
  }

  guardarNotas(): void {
    if (!this.citaSeleccionada) return;
    this.citaService.guardarNotasGrooming(this.citaSeleccionada.id, this.notasNuevas).subscribe(() => {
      this.citaSeleccionada!.notasGrooming = this.notasNuevas;
      // Aquí podríamos mostrar un pequeño mensaje de "Guardado"
    });
  }
}

