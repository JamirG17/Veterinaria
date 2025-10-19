import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistoriaClinica } from '../../models/api-models';
import { HistoriaClinicaService } from '../../services/historia-clinica.service';

@Component({
  selector: 'app-historial-clinico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-clinico.component.html',
  styleUrls: ['./historial-clinico.component.scss']
})
export class HistorialClinicoComponent implements OnInit {

  todosLosRegistros: HistoriaClinica[] = [];
  registrosFiltrados: HistoriaClinica[] = [];
  filtroTexto: string = '';

  constructor(
    private historiaClinicaService: HistoriaClinicaService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.historiaClinicaService.getHistorialCompleto().subscribe(data => {
      this.todosLosRegistros = data;
      this.registrosFiltrados = data;
      this.cdr.markForCheck();
    });
  }

  aplicarFiltros(): void {
    const term = this.filtroTexto.toLowerCase();
    this.registrosFiltrados = this.todosLosRegistros.filter(registro =>
      registro.mascota.nombre.toLowerCase().includes(term) ||
      registro.mascota.propietario?.nombre.toLowerCase().includes(term) ||
      registro.mascota.propietario?.apellido.toLowerCase().includes(term) ||
      registro.diagnostico.toLowerCase().includes(term)
    );
  }
}
