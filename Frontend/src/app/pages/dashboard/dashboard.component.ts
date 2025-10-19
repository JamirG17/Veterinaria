import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Cita } from '../../models/api-models';
import { CitaService } from '../../services/cita.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  citasDeHoy: Cita[] = [];
  proximasCitas: Cita[] = [];
  mascotasParaRecoger: Cita[] = [];
  
  showDetailModal = false;
  citaDetalle: Cita | null = null;
  
  stats = {
    totalHoy: 0,
    enEspera: 0,
    completadas: 0
  };

  constructor(
    private citaService: CitaService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas(): void {
    this.citaService.getCitas().subscribe(data => {
      
      console.log("Datos crudos de la API:", data);

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      this.citasDeHoy = data.filter(cita => {
        const parts = cita.fechaHora.split(/[-T:]/);
        const fechaCitaLocal = new Date(
          Number(parts[0]), 
          Number(parts[1]) - 1, 
          Number(parts[2]), 
          Number(parts[3]), 
          Number(parts[4]), 
          Number(parts[5] || 0)
        );
        
        return fechaCitaLocal.getFullYear() === hoy.getFullYear() &&
               fechaCitaLocal.getMonth() === hoy.getMonth() &&
               fechaCitaLocal.getDate() === hoy.getDate();
      });

      console.log("Citas filtradas para hoy:", this.citasDeHoy);
      
      this.citasDeHoy.sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());
      
      this.actualizarStats();
      this.filtrarProximasCitas();
      this.filtrarMascotasParaRecoger();
      
      this.cdr.markForCheck();
    });
  }

  marcarComoEnEspera(citaId: number, event: MouseEvent): void {
    event.stopPropagation();
    this.citaService.updateEstadoCita(citaId, 'EN ESPERA').subscribe(() => {
      this.cargarCitas();
    });
  }

  verDetalle(cita: Cita): void {
    this.citaDetalle = cita;
    this.showDetailModal = true;
  }

  cerrarModal(): void {
    this.showDetailModal = false;
    this.citaDetalle = null;
  }

  actualizarStats(): void {
    this.stats.totalHoy = this.citasDeHoy.length;
    this.stats.enEspera = this.citasDeHoy.filter(c => c.estado === 'EN ESPERA').length;
    this.stats.completadas = this.citasDeHoy.filter(c => c.estado === 'COMPLETADA').length;
  }

  // --- MÉTODO CORREGIDO ---
  filtrarProximasCitas(): void {
    // Ahora muestra todas las citas de hoy que no estén completadas o canceladas,
    // sin importar si su hora ya pasó.
    this.proximasCitas = this.citasDeHoy
      .filter(c => c.estado !== 'COMPLETADA' && c.estado !== 'CANCELADA')
      .slice(0, 4);
  }

  filtrarMascotasParaRecoger(): void {
    this.mascotasParaRecoger = this.citasDeHoy.filter(cita => cita.estado === 'COMPLETADA');
  }

  navegarA(ruta: string): void {
    this.router.navigate([ruta]);
  }
}

