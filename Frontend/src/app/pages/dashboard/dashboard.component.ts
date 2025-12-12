import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
export class DashboardComponent implements OnInit, OnDestroy {

  citasDeHoy: Cita[] = [];
  proximasCitas: Cita[] = [];
  pacientesEnClinica: Cita[] = []; // Renombrado
  mascotasParaRecoger: Cita[] = [];
  mascotasEntregadas: Cita[] = [];
  
  showDetailModal = false;
  citaDetalle: Cita | null = null;
  
  stats = {
    totalHoy: 0,
    enClinica: 0, // Renombrado
    finalizados: 0 // Renombrado
  };

  private pollingInterval: any;

  constructor(
    private citaService: CitaService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarCitas();
    this.pollingInterval = setInterval(() => {
      console.log("Polling: Recargando citas...");
      this.cargarCitas();
    }, 10000);
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  cargarCitas(): void {
    this.citaService.getCitas().subscribe(data => {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      this.citasDeHoy = data.filter(cita => {
        const parts = cita.fechaHora.split(/[-T:]/);
        const fechaCitaLocal = new Date(
          Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 
          Number(parts[3]), Number(parts[4]), Number(parts[5] || 0)
        );
        return fechaCitaLocal.getFullYear() === hoy.getFullYear() &&
               fechaCitaLocal.getMonth() === hoy.getMonth() &&
               fechaCitaLocal.getDate() === hoy.getDate();
      });
      
      this.citasDeHoy.sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());
      
      this.actualizarListas();
      this.cdr.markForCheck();
    });
  }

  actualizarListas(): void {
    // 1. Próximas Citas (Solo 'PROGRAMADA')
    this.proximasCitas = this.citasDeHoy
      .filter(c => c.estado === 'PROGRAMADA');

    // 2. Pacientes en Clínica (Los que llegaron y los que están siendo atendidos)
    this.pacientesEnClinica = this.citasDeHoy.filter(c => 
      c.estado === 'EN ESPERA' || 
      c.estado === 'EN CONSULTA' || 
      c.estado === 'EN PROGRESO'
    );

    // 3. Listos para Recoger (Servicio finalizado, no entregado)
    // --- LÓGICA CORREGIDA ---
    // La mascota solo está lista para recoger si su cita está 'COMPLETADA'
    // Y (AND) NO tiene una cita siguiente (es decir, citaSiguienteId es nulo o indefinido).
    this.mascotasParaRecoger = this.citasDeHoy.filter(cita => 
      cita.estado === 'COMPLETADA' && 
      (cita.citaSiguienteId === null || cita.citaSiguienteId === undefined)
    );

    // 4. Entregados (Ya se fueron)
    this.mascotasEntregadas = this.citasDeHoy.filter(cita => cita.estado === 'ENTREGADO');

    // Actualizar Estadísticas
    this.stats.totalHoy = this.citasDeHoy.filter(c => c.estado !== 'CANCELADA' && c.estado !== 'PENDIENTE_DE_VETERINARIO').length;
    this.stats.enClinica = this.pacientesEnClinica.length;
    // 'finalizados' incluye las listas para recoger Y las ya entregadas
    this.stats.finalizados = this.mascotasParaRecoger.length + this.mascotasEntregadas.length;
  }

  marcarComoEnEspera(cita: Cita, event: MouseEvent): void {
    event.stopPropagation();
    this.citaService.updateEstadoCita(cita.id, 'EN ESPERA').subscribe(() => {
      this.cargarCitas();
    });
  }

  marcarComoEntregado(citaId: number, event: MouseEvent): void {
    event.stopPropagation();
    this.citaService.updateEstadoCita(citaId, 'ENTREGADO').subscribe(() => {
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

  navegarA(ruta: string) {
    this.router.navigateByUrl(ruta);
  }
}