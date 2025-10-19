import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cita } from '../../models/api-models';
import { CitaService } from '../../services/cita.service';
import { isWithinInterval, parseISO } from 'date-fns';

@Component({
  selector: 'app-grooming-historial',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grooming-historial.component.html',
  styleUrls: ['./grooming-historial.component.scss']
})
export class GroomingHistorialComponent implements OnInit {

  todasLasCitas: Cita[] = [];
  citasFiltradas: Cita[] = [];

  // Filtros
  filtroEstado: string = 'TODAS';
  filtroTexto: string = ''; // Para DNI o Nombre
  filtroFechaDesde: string = '';
  filtroFechaHasta: string = '';

  constructor(
    private citaService: CitaService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.citaService.getHistorialGroomingCompleto().subscribe(data => {
      this.todasLasCitas = data;
      this.aplicarFiltros();
      this.cdr.markForCheck();
    });
  }

  aplicarFiltros(): void {
    let citasTemp = this.todasLasCitas;

    // Filtrar por estado
    if (this.filtroEstado !== 'TODAS') {
      citasTemp = citasTemp.filter(cita => cita.estado === this.filtroEstado);
    }

    // Filtrar por texto (DNI o nombre del propietario)
    if (this.filtroTexto.trim() !== '') {
      const textoBusqueda = this.filtroTexto.toLowerCase();
      // --- LÍNEAS CORREGIDAS ---
      citasTemp = citasTemp.filter(cita => 
        cita.mascota.propietario?.dni.toLowerCase().includes(textoBusqueda) ||
        cita.mascota.propietario?.nombre.toLowerCase().includes(textoBusqueda) ||
        cita.mascota.propietario?.apellido.toLowerCase().includes(textoBusqueda)
      );
    }
    
    // Filtrar por rango de fechas
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
}

