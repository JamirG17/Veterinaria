// Define la estructura de un evento para la librería del calendario
export interface CalendarEvent {
  start: Date;
  end?: Date;
  title: string;
  color?: {
    primary: string;
    secondary: string;
  };
  meta?: any; // Para guardar datos extra como el ID de la cita
}

// Interfaces que coinciden con los modelos del backend

export interface Usuario {
  id: number;
  username: string;
  roles: string[];
}

export interface Propietario {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email: string;
  mascotas: Mascota[];
}

export interface Mascota {
  id: number;
  nombre: string;
  raza: string;
  sexo: string;
  esterilizado: boolean;
  fechaNacimiento: string;
  peso: number;
  propietario?: Propietario;
  propietarioId?: number;
  // --- CAMPO AÑADIDO ---
  alergias?: string; // Es opcional, por eso el '?'
}

export interface Cita {
  id: number;
  fechaHora: string;
  motivo: string;
  estado: string;
  mascota: Mascota;
  asignadoA: Usuario;
  area: string;
  citaSiguienteId?: number;
  // --- CAMPO AÑADIDO ---
  notasGrooming?: string; // Es opcional, por eso el '?'
}

export interface HistoriaClinica {
  id: number;
  fecha: string;
  sintomas: string;
  diagnostico: string;
  tratamiento: string;
  mascota: Mascota;
  veterinario: Usuario;
}

// --- NUEVA INTERFAZ ---
export interface Prevencion {
  id: number;
  tipo: string;
  producto: string;
  fechaAplicacion: string;
  proximaFecha: string;
}

export interface PacienteDetalle {
  mascota: Mascota;
  propietario: Propietario;
  historialClinico: HistoriaClinica[];
  historialGrooming: Cita[];
  proximasCitas: Cita[];
  prevenciones: Prevencion[]; // <-- AÑADIDO
}

