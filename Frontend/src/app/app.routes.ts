import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { GestionCitasComponent } from './pages/gestion-citas/gestion-citas.component';
import { PacientesComponent } from './pages/pacientes/pacientes.component';
import { PropietarioDetalleComponent } from './pages/propietario-detalle/propietario-detalle.component';
import { HistorialCitasComponent } from './pages/historial-citas/historial-citas.component'; // <-- IMPORTAMOS
import { GroomingAgendaComponent } from './pages/grooming-agenda/grooming-agenda.component';
import { GroomingDashboardComponent } from './pages/grooming-dashboard/grooming-dashboard.component';
import { GroomingHistorialComponent } from './pages/grooming-historial/grooming-historial.component';
import { VeterinarioDashboardComponent } from './pages/veterinario-dashboard/veterinario-dashboard.component';
import { ConsultaComponent } from './pages/consulta/consulta.component';
import { PacienteFichaComponent } from './pages/paciente-ficha/paciente-ficha.component';
import { HistorialClinicoComponent } from './pages/historial-clinico/historial-clinico.component';
import { ListaPacientesComponent } from './pages/lista-pacientes/lista-pacientes.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'gestion-citas', component: GestionCitasComponent },
      { path: 'pacientes', component: PacientesComponent },
      { path: 'pacientes/:id', component: PropietarioDetalleComponent },
      { path: 'historial-citas', component: HistorialCitasComponent },
      { path: 'agenda-grooming', component: GroomingAgendaComponent },
      { path: 'grooming-dashboard', component: GroomingDashboardComponent },
      { path: 'historial-grooming', component: GroomingHistorialComponent },
      { path: 'veterinario-dashboard', component: VeterinarioDashboardComponent },
      { path: 'consulta/:id', component: ConsultaComponent },
      { path: 'paciente/ficha/:id', component: PacienteFichaComponent },
      { path: 'historial-clinico', component: HistorialClinicoComponent },
      { path: 'lista-pacientes', component: ListaPacientesComponent }, // <-- AÑADIMOS RUTA
    ]
  },
  { path: '**', redirectTo: '/login' }
];

