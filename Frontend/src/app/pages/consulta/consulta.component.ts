import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Cita, PacienteDetalle, Mascota, Prevencion } from '../../models/api-models';
import { CitaService } from '../../services/cita.service';
import { HistoriaClinicaService } from '../../services/historia-clinica.service';
import { PacienteService } from '../../services/paciente.service';
import { MascotaService } from '../../services/mascota.service';
import { PrevencionService } from '../../services/prevencion.service';
import { IaService } from '../../services/ia.service';

declare var webkitSpeechRecognition: any;

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
    titulo: '',
    sintomas: '',
    diagnostico: '',
    tratamiento: ''
  };

  isDictando = false;
  textoDictado = '';
  isAnalizandoIA = false;
  textoTranscritoCrudo = '';
  
  registroDetallado: number | null = null;

  private recognition: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private citaService: CitaService,
    private historiaClinicaService: HistoriaClinicaService,
    private pacienteService: PacienteService,
    private mascotaService: MascotaService,
    private prevencionService: PrevencionService,
    private iaService: IaService,
    private location: Location,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new webkitSpeechRecognition();
      this.recognition.lang = 'es-PE';
      this.recognition.continuous = true;
      this.recognition.interimResults = true;

      this.recognition.onresult = (event: any) => {
        let interim_transcript = '';
        let final_transcript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final_transcript += event.results[i][0].transcript;
          } else {
            interim_transcript += event.results[i][0].transcript;
          }
        }
        
        this.ngZone.run(() => {
          this.textoDictado = interim_transcript;
          if (final_transcript) {
            this.textoTranscritoCrudo += final_transcript.trim() + '. ';
          }
        });
      };

      this.recognition.onend = () => {
        this.ngZone.run(() => {
          this.isDictando = false;
          this.textoDictado = '';
          if (this.textoTranscritoCrudo) {
            this.solicitarAnalisisIA(this.textoTranscritoCrudo);
          }
        });
      };
      
      this.recognition.onerror = (event: any) => {
        console.error("Error de reconocimiento de voz:", event.error);
        this.ngZone.run(() => { this.isDictando = false; });
      };
      
    } else {
      console.warn("Reconocimiento de voz no soportado en este navegador.");
    }
  }

  ngOnInit(): void {
    const citaId = this.route.snapshot.paramMap.get('id');
    if (citaId) {
      this.cargarDatosCita(+citaId);
    }
  }
  
  toggleDictado(): void {
    if (!this.recognition) return;
    if (this.isDictando) {
      this.recognition.stop();
    } else {
      this.textoTranscritoCrudo = '';
      this.recognition.start();
      this.textoDictado = 'Escuchando...';
      this.isDictando = true;
    }
  }

  solicitarAnalisisIA(texto: string): void {
    this.isAnalizandoIA = true;
    this.textoDictado = 'Analizando dictado con IA...';

    this.iaService.analizarTexto(texto).subscribe({
      next: (response) => {
        this.isAnalizandoIA = false;
        this.textoDictado = '';
        this.consultaActual.titulo = response.titulo;
        this.consultaActual.sintomas = response.sintomas;
        this.consultaActual.diagnostico = response.diagnostico;
        this.consultaActual.tratamiento = response.tratamiento;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error("Error al analizar con IA:", err);
        this.isAnalizandoIA = false;
        this.textoDictado = 'Error al analizar. Revise la consola.';
        this.consultaActual.sintomas = texto; 
        this.cdr.markForCheck();
      }
    });
  }

  toggleDetalle(registroId: number): void {
    if (this.registroDetallado === registroId) {
      this.registroDetallado = null; // Si ya está abierto, lo cierra
    } else {
      this.registroDetallado = registroId; // Si está cerrado, lo abre
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
  
  // --- MÉTODO AÑADIDO QUE FALTABA ---
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
      
      if (pasarAGrooming) {
        // --- LLAMADA AL NUEVO SERVICIO DEL BACKEND ---
        this.citaService.finalizarYPasarAGrooming(this.citaActual!.id).subscribe(() => {
          this.router.navigate(['/veterinario-dashboard']);
        });
      } else {
        // Si es consulta simple, solo se completa
        this.citaService.updateEstadoCita(this.citaActual!.id, 'COMPLETADA').subscribe(() => {
          this.router.navigate(['/veterinario-dashboard']);
        });
      }
    });
  }
  
  regresar(): void {
    this.location.back();
  }
}