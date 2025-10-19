import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Cita } from '../../models/api-models';
import { CitaService } from '../../services/cita.service';

@Component({
  selector: 'app-grooming-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grooming-dashboard.component.html',
  styleUrls: ['./grooming-dashboard.component.scss']
})
export class GroomingDashboardComponent implements OnInit {

  citasDeHoy: Cita[] = [];
  proximasCitas: Cita[] = [];
  stats = {
    total: 0,
    completadas: 0,
    pendientes: 0
  };

  constructor(
    private router: Router,
    private citaService: CitaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarAgenda();
  }

  cargarAgenda(): void {
    this.citaService.getAgendaGroomerHoy().subscribe(data => {
      this.citasDeHoy = data.sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());
      this.actualizarStats();
      this.filtrarProximasCitas();
      this.cdr.markForCheck();
    });
  }

  // --- MÉTODO CORREGIDO ---
  actualizarStats(): void {
    this.stats.total = this.citasDeHoy.length;
    this.stats.completadas = this.citasDeHoy.filter(c => c.estado === 'COMPLETADA').length;
    
    // Contamos también las canceladas
    const canceladas = this.citasDeHoy.filter(c => c.estado === 'CANCELADA').length;
    
    // Las pendientes son el total menos las completadas y las canceladas.
    this.stats.pendientes = this.stats.total - this.stats.completadas - canceladas;
  }

  filtrarProximasCitas(): void {
    const ahora = new Date();
    this.proximasCitas = this.citasDeHoy
      .filter(c => new Date(c.fechaHora) > ahora && c.estado !== 'COMPLETADA' && c.estado !== 'CANCELADA')
      .slice(0, 3);
  }

  irAAgenda(): void {
    this.router.navigate(['/agenda-grooming']);
  }
}

