import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Cita, PacienteDetalle } from '../../models/api-models';
import { CitaService } from '../../services/cita.service';
import { HistoriaClinicaService } from '../../services/historia-clinica.service';
import { PacienteService } from '../../services/paciente.service';

@Component({
  selector: 'app-consulta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consulta.component.html',
  styleUrls: ['./consulta.component.scss']
})
export class ConsultaComponent implements OnInit {

  citaActual: Cita | null = null;
  detallePaciente: PacienteDetalle | null = null;
  
  consultaActual = {
    sintomas: '',
    diagnostico: '',
    tratamiento: ''
  };

  isDictando = false;
  textoDictado = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private citaService: CitaService,
    private historiaClinicaService: HistoriaClinicaService,
    private pacienteService: PacienteService,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const citaId = this.route.snapshot.paramMap.get('id');
    if (citaId) {
      this.cargarDatosCita(+citaId);
    }
  }

  cargarDatosCita(citaId: number): void {
    this.citaService.getCitaPorId(citaId).subscribe(cita => {
      this.citaActual = cita;
      this.pacienteService.getDetalleCompleto(cita.mascota.id).subscribe(detalle => {
        this.detallePaciente = detalle;
        this.cdr.markForCheck();
      });
    });
  }
  
  verFichaCompleta(): void {
    if (this.detallePaciente) {
      this.router.navigate(['/paciente/ficha', this.detallePaciente.mascota.id]);
    }
  }

  guardarYFinalizar(pasarAGrooming: boolean = false): void {
    if (!this.citaActual || !this.detallePaciente) return;

    const nuevoRegistro = {
      ...this.consultaActual,
      mascotaId: this.detallePaciente.mascota.id,
      veterinarioId: this.citaActual.asignadoA.id
    };

    this.historiaClinicaService.createRegistro(nuevoRegistro).subscribe(() => {
      let estadoFinal = 'COMPLETADA';
      if (pasarAGrooming) {
        console.log('Notificando a Grooming...');
      }

      this.citaService.updateEstadoCita(this.citaActual!.id, estadoFinal).subscribe(() => {
        this.router.navigate(['/veterinario-dashboard']);
      });
    });
  }

  toggleDictado(): void {
    this.isDictando = !this.isDictando;
    if (this.isDictando) { this.textoDictado = 'Escuchando...'; } 
    else { this.textoDictado = ''; }
  }

  regresar(): void {
    this.location.back();
  }
}

