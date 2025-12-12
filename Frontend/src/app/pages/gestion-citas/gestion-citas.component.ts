import { Component, OnInit, ChangeDetectorRef, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CalendarModule, CalendarView, CalendarEvent } from 'angular-calendar';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { isSameDay } from 'date-fns';

import { Cita, Mascota, Propietario, Usuario } from '../../models/api-models';
import { CitaService } from '../../services/cita.service';
import { PropietarioService } from '../../services/propietario.service';
import { UsuarioService } from '../../services/usuario.service';
import { MascotaService } from '../../services/mascota.service';
// --- IMPORTAMOS EL SERVICIO DE RAZAS ---
import { RazaService, Raza } from '../../services/raza.service';

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
  
  dayStartHour: number = 7;
  dayEndHour: number = 20;

  showModal = false;
  successMessage: string | null = null;
  
  showOwnerModal = false;
  nuevoPropietario: Propietario = { id: 0, nombre: '', apellido: '', dni: '', telefono: '', email: '', mascotas: [] };
  
  showPetModal = false;
  nuevaMascotaRapida: Mascota = this.inicializarMascota();

  // --- VARIABLES PARA EL SELECTOR DE RAZAS ---
  razas: Raza[] = [];
  razasFiltradas: Raza[] = [];
  razaSearchTerm: string = '';
  mostrarInputNuevaRaza = false;
  nuevaRazaNombre = '';
  
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
    private mascotaService: MascotaService,
    private usuarioService: UsuarioService,
    private razaService: RazaService, // <-- INYECTAMOS EL SERVICIO
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.generarTodosLosHorarios();
  }

  ngOnInit(): void {
    this.cargarDatosIniciales();
    this.route.queryParams.subscribe(params => {
      if (params['abrirModal'] === 'true') {
        this.abrirModalNuevaCita();
      }
    });
  }

  cargarDatosIniciales(): void {
    this.citaService.getCitas().subscribe((citas: Cita[]) => {
      this.events = citas.map(cita => ({
        start: new Date(cita.fechaHora),
        title: `[${cita.area}] ${cita.motivo} - ${cita.mascota.nombre}`,
        color: { primary: '#387ADF', secondary: '#D1E1F8' },
        meta: cita,
      }));
      this.actualizarHorariosDisponibles(); 
      this.cdr.markForCheck();
    });

    this.cargarPropietarios();
    this.cargarRazas(); // <-- CARGAMOS LAS RAZAS AL INICIO
    
    this.usuarioService.getVeterinarios().subscribe((data: Usuario[]) => {
      this.veterinarios = data;
      this.onAreaChange();
    });
    
    this.usuarioService.getGroomers().subscribe((data: Usuario[]) => this.groomers = data);
  }

  cargarPropietarios(): void {
    this.propietarioService.getPropietarios().subscribe((data: Propietario[]) => this.propietarios = data);
  }

  // --- MÉTODOS PARA GESTIONAR RAZAS ---
  cargarRazas(): void {
    this.razaService.getRazas().subscribe(data => {
      this.razas = data.sort((a, b) => a.nombre.localeCompare(b.nombre));
      this.razasFiltradas = this.razas;
    });
  }

  filtrarRazas(): void {
    if (!this.razaSearchTerm) {
      this.razasFiltradas = this.razas;
    } else {
      const term = this.razaSearchTerm.toLowerCase();
      this.razasFiltradas = this.razas.filter(r => r.nombre.toLowerCase().includes(term));
    }
  }

  seleccionarRaza(razaNombre: string): void {
    if (razaNombre === 'otra') {
      this.mostrarInputNuevaRaza = true;
      this.razaSearchTerm = '';
    } else {
      this.nuevaMascotaRapida.raza = razaNombre;
      this.razaSearchTerm = razaNombre;
      this.mostrarInputNuevaRaza = false;
    }
  }

  guardarNuevaRaza(): void {
    if (this.nuevaRazaNombre.trim()) {
      this.razaService.createRaza({ nombre: this.nuevaRazaNombre }).subscribe(nuevaRaza => {
        this.cargarRazas();
        this.nuevaMascotaRapida.raza = nuevaRaza.nombre;
        this.razaSearchTerm = nuevaRaza.nombre;
        this.mostrarInputNuevaRaza = false;
        this.nuevaRazaNombre = '';
        this.cdr.markForCheck();
      });
    }
  }

  // --- Resto de métodos de búsqueda y flujo ---
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

  iniciarCreacionPropietario(): void {
    this.nuevoPropietario = { 
      id: 0, nombre: '', apellido: '', dni: this.propietarioSearchTerm, telefono: '', email: '', mascotas: [] 
    };
    this.propietariosEncontrados = [];
    this.showOwnerModal = true;
  }

  cerrarModalPropietario(): void {
    this.showOwnerModal = false;
  }

  guardarNuevoPropietario(form: NgForm): void {
    if (form.invalid) return;
    this.propietarioService.createPropietario(this.nuevoPropietario).subscribe(propGuardado => {
      this.cargarPropietarios();
      this.seleccionarPropietario(propGuardado);
      this.cerrarModalPropietario();
      this.mostrarMensajeExito('Propietario creado y seleccionado.');
    });
  }

  iniciarCreacionMascota(): void {
    if (!this.propietarioSeleccionado) return;
    
    this.nuevaMascotaRapida = this.inicializarMascota();
    this.nuevaMascotaRapida.propietarioId = this.propietarioSeleccionado.id;
    
    // Reseteamos el buscador de razas
    this.razaSearchTerm = '';
    this.filtrarRazas();
    this.mostrarInputNuevaRaza = false;
    
    this.showPetModal = true;
  }

  cerrarModalMascota(): void {
    this.showPetModal = false;
  }

  guardarNuevaMascota(form: NgForm): void {
    if (form.invalid) return;
    
    // Si escribió una raza pero no la seleccionó, la usamos
    if (this.razaSearchTerm && this.nuevaMascotaRapida.raza !== this.razaSearchTerm) {
         this.nuevaMascotaRapida.raza = this.razaSearchTerm;
    }

    const mascotaDto = {
      ...this.nuevaMascotaRapida,
      propietarioId: this.propietarioSeleccionado!.id
    };

    this.mascotaService.createMascota(mascotaDto).subscribe(mascotaGuardada => {
      this.mascotasDelPropietario.push(mascotaGuardada);
      this.nuevaCita.mascotaId = mascotaGuardada.id;
      this.cerrarModalMascota();
      this.mostrarMensajeExito('Mascota creada y seleccionada.');
    });
  }

  private inicializarMascota(): Mascota {
    return {
      id: 0, nombre: '', raza: '', sexo: 'MACHO', esterilizado: false,
      fechaNacimiento: '', peso: 0, propietarioId: 0
    };
  }

  generarTodosLosHorarios(): void {
    for (let i = 7; i <= 19; i++) {
      this.todosLosHorarios.push(`${i.toString().padStart(2, '0')}:00`);
    }
  }

  actualizarHorariosDisponibles(): void {
    if (!this.nuevaCita.fecha) {
      this.horariosDisponibles = [];
      return;
    }

    const [year, month, day] = this.nuevaCita.fecha.split('-').map(Number);
    const fechaSeleccionada = new Date(year, month - 1, day);

    const citasDelDia = this.events.filter(event =>
        isSameDay(event.start, fechaSeleccionada)
    );

    const horasOcupadasVeterinaria = citasDelDia
        .filter(e => e.meta.area === 'VETERINARIA' || e.meta.area === 'AMBOS')
        .map(e => e.start.getHours());

    const horasOcupadasGrooming = citasDelDia
        .filter(e => e.meta.area === 'GROOMING' || e.meta.area === 'AMBOS')
        .map(e => e.start.getHours());

    this.horariosDisponibles = this.todosLosHorarios.filter(horaStr => {
        const hora = parseInt(horaStr.split(':')[0]);
        if (this.nuevaCita.area === 'VETERINARIA') return !horasOcupadasVeterinaria.includes(hora);
        if (this.nuevaCita.area === 'GROOMING') return !horasOcupadasGrooming.includes(hora);
        if (this.nuevaCita.area === 'AMBOS') return !horasOcupadasVeterinaria.includes(hora) && !horasOcupadasGrooming.includes(hora);
        return true;
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