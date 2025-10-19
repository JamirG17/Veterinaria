import { Component, OnInit, ChangeDetectorRef, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { CalendarModule, CalendarView, CalendarEvent } from 'angular-calendar';
import { Cita, Mascota, Propietario, Usuario } from '../../models/api-models';
import { CitaService } from '../../services/cita.service';
import { PropietarioService } from '../../services/propietario.service';
import { UsuarioService } from '../../services/usuario.service';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { isSameDay } from 'date-fns';

registerLocaleData(localeEs);

@Component({
  selector: 'app-gestion-citas',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarModule],
  templateUrl: './gestion-citas.component.html',
  styleUrls: ['./gestion-citas.component.scss'],
  providers: [{ provide: LOCALE_ID, useValue: 'es' }],
})
export class GestionCitasComponent implements OnInit {
  
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  
  // --- PROPIEDADES AÑADIDAS PARA CONFIGURAR LAS HORAS VISIBLES ---
  dayStartHour: number = 7; // El calendario mostrará desde las 7 AM
  dayEndHour: number = 20;  // El calendario mostrará hasta las 8 PM

  showModal = false;
  successMessage: string | null = null;
  
  propietarios: Propietario[] = [];
  propietarioSearchTerm = '';
  propietariosEncontrados: Propietario[] = [];
  propietarioSeleccionado: Propietario | null = null;
  mascotasDelPropietario: Mascota[] = [];

  veterinarios: Usuario[] = [];
  groomers: Usuario[] = [];
  profesionalesFiltrados: Usuario[] = [];

  nuevaCita = {
    mascotaId: null as number | null,
    asignadoAId: null as number | null,
    asignadoAGroomingId: null as number | null,
    fecha: '',
    hora: '',
    motivo: '',
    area: 'VETERINARIA'
  };

  horariosDisponibles: string[] = [];
  todosLosHorarios: string[] = [];

  constructor(
    private citaService: CitaService,
    private propietarioService: PropietarioService,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef
  ) {
    this.generarTodosLosHorarios();
  }

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales(): void {
    this.citaService.getCitas().subscribe((citas: Cita[]) => {
      this.events = citas.map(cita => ({
        start: new Date(cita.fechaHora),
        title: `[${cita.area}] ${cita.motivo} - ${cita.mascota.nombre}`,
        color: { primary: '#387ADF', secondary: '#D1E1F8' },
        meta: cita,
      }));
      // Llamamos a actualizar horarios aquí para que se calcule con los datos frescos
      this.actualizarHorariosDisponibles(); 
      this.cdr.markForCheck();
    });
    this.propietarioService.getPropietarios().subscribe((data: Propietario[]) => this.propietarios = data);
    this.usuarioService.getVeterinarios().subscribe((data: Usuario[]) => {
      this.veterinarios = data;
      this.onAreaChange();
    });
    this.usuarioService.getGroomers().subscribe((data: Usuario[]) => this.groomers = data);
  }

  buscarPropietario(): void {
    if (this.propietarioSearchTerm.length < 2) {
      this.propietariosEncontrados = [];
      return;
    }
    const term = this.propietarioSearchTerm.toLowerCase();
    this.propietariosEncontrados = this.propietarios.filter(p =>
      p.nombre.toLowerCase().includes(term) ||
      p.apellido.toLowerCase().includes(term) ||
      p.dni.toLowerCase().includes(term)
    );
  }

  seleccionarPropietario(propietario: Propietario): void {
    this.propietarioSeleccionado = propietario;
    this.mascotasDelPropietario = propietario.mascotas || [];
    this.propietarioSearchTerm = `${propietario.nombre} ${propietario.apellido}`;
    this.propietariosEncontrados = [];
  }

  generarTodosLosHorarios(): void {
    for (let i = 7; i <= 19; i++) {
      this.todosLosHorarios.push(`${i.toString().padStart(2, '0')}:00`);
    }
  }

  // --- MÉTODO CORREGIDO Y REFORZADO ---
  actualizarHorariosDisponibles(): void {
    if (!this.nuevaCita.fecha) {
      this.horariosDisponibles = [];
      return;
    }

    // El input 'date' devuelve 'YYYY-MM-DD'. new Date() lo interpreta como UTC.
    // Para evitar problemas de zona horaria, dividimos el string y creamos la fecha localmente.
    const [year, month, day] = this.nuevaCita.fecha.split('-').map(Number);
    const fechaSeleccionada = new Date(year, month - 1, day);

    const citasDelDia = this.events.filter(event =>
        isSameDay(event.start, fechaSeleccionada)
    );

    // Un slot de veterinaria está ocupado si el área es VETERINARIA o AMBOS
    const horasOcupadasVeterinaria = citasDelDia
        .filter(e => e.meta.area === 'VETERINARIA' || e.meta.area === 'AMBOS')
        .map(e => e.start.getHours());

    // Un slot de grooming está ocupado si el área es GROOMING o AMBOS
    const horasOcupadasGrooming = citasDelDia
        .filter(e => e.meta.area === 'GROOMING' || e.meta.area === 'AMBOS')
        .map(e => e.start.getHours());

    this.horariosDisponibles = this.todosLosHorarios.filter(horaStr => {
        const hora = parseInt(horaStr.split(':')[0]);

        if (this.nuevaCita.area === 'VETERINARIA') {
            return !horasOcupadasVeterinaria.includes(hora);
        }
        if (this.nuevaCita.area === 'GROOMING') {
            return !horasOcupadasGrooming.includes(hora);
        }
        if (this.nuevaCita.area === 'AMBOS') {
            // Para "AMBOS", el horario debe estar libre en ambos servicios
            return !horasOcupadasVeterinaria.includes(hora) && !horasOcupadasGrooming.includes(hora);
        }
        return true; // No debería ocurrir
    });
    this.cdr.markForCheck();
  }

  guardarCita(form: NgForm): void {
    if (form.invalid || !this.nuevaCita.fecha || !this.nuevaCita.hora) return;
    
    const fechaHoraLocalString = `${this.nuevaCita.fecha}T${this.nuevaCita.hora}:00`;

    const citaParaEnviar = { 
      ...this.nuevaCita, 
      fechaHora: fechaHoraLocalString 
    };

    this.citaService.createCita(citaParaEnviar).subscribe(() => {
      this.cargarDatosIniciales();
      this.cerrarModal();
      this.mostrarMensajeExito('Cita registrada correctamente.');
    });
  }

  abrirModalNuevaCita(): void {
    this.nuevaCita = { mascotaId: null, asignadoAId: null, asignadoAGroomingId: null, fecha: '', hora: '', motivo: '', area: 'VETERINARIA' };
    this.propietarioSeleccionado = null;
    this.propietarioSearchTerm = '';
    this.mascotasDelPropietario = [];
    this.onAreaChange();
    this.actualizarHorariosDisponibles();
    this.showModal = true;
  }
  
  onAreaChange(): void {
    this.actualizarHorariosDisponibles();
    if (this.nuevaCita.area === 'VETERINARIA') {
      this.profesionalesFiltrados = this.veterinarios;
    } else if (this.nuevaCita.area === 'GROOMING') {
      this.profesionalesFiltrados = this.groomers;
    } else {
      this.profesionalesFiltrados = this.veterinarios;
    }
    this.nuevaCita.asignadoAId = null;
  }
  
  setView(view: CalendarView) { this.view = view; }
  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {}
  cerrarModal(): void { this.showModal = false; }
  mostrarMensajeExito(message: string): void {
    this.successMessage = message;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.successMessage = null;
      this.cdr.markForCheck();
    }, 3000);
  }
}

