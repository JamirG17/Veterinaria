import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Cita } from '../../models/api-models';
import { CitaService } from '../../services/cita.service';

@Component({
  selector: 'app-veterinario-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './veterinario-dashboard.component.html',
  styleUrls: ['./veterinario-dashboard.component.scss']
})
export class VeterinarioDashboardComponent implements OnInit {

  pacientesEnConsulta: Cita[] = [];
  pacientesEnEspera: Cita[] = [];
  proximasCitasProgramadas: Cita[] = [];

  constructor(
    private citaService: CitaService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarAgenda();
  }

  cargarAgenda(): void {
    this.citaService.getAgendaVeterinarioHoy().subscribe(data => {
      this.pacientesEnConsulta = data.filter(c => c.estado === 'EN CONSULTA');
      this.pacientesEnEspera = data.filter(c => c.estado === 'EN ESPERA');
      this.proximasCitasProgramadas = data.filter(c => c.estado === 'PROGRAMADA');
      
      this.cdr.markForCheck();
    });
  }

  iniciarConsulta(cita: Cita): void {
    this.citaService.updateEstadoCita(cita.id, 'EN CONSULTA').subscribe(() => {
      // Navigates to the new consultation page
      this.router.navigate(['/consulta', cita.id]);
    });
  }
  
  continuarConsulta(cita: Cita): void {
    // Also navigates to the consultation page
    this.router.navigate(['/consulta', cita.id]);
  }
}

