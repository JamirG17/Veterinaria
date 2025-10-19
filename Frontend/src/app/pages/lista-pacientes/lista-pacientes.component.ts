import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Mascota } from '../../models/api-models';
import { MascotaService } from '../../services/mascota.service';

@Component({
  selector: 'app-lista-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-pacientes.component.html',
  styleUrls: ['./lista-pacientes.component.scss']
})
export class ListaPacientesComponent implements OnInit {

  todosLosPacientes: Mascota[] = [];
  pacientesFiltrados: Mascota[] = [];
  filtroTexto: string = '';

  constructor(
    private mascotaService: MascotaService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarPacientes();
  }

  cargarPacientes(): void {
    this.mascotaService.getMascotas().subscribe(data => {
      this.todosLosPacientes = data;
      this.pacientesFiltrados = data;
      this.cdr.markForCheck();
    });
  }

  aplicarFiltros(): void {
    const term = this.filtroTexto.toLowerCase();
    this.pacientesFiltrados = this.todosLosPacientes.filter(mascota =>
      mascota.nombre.toLowerCase().includes(term) ||
      mascota.propietario?.nombre.toLowerCase().includes(term) ||
      mascota.propietario?.apellido.toLowerCase().includes(term) ||
      mascota.propietario?.dni.toLowerCase().includes(term)
    );
  }

  verFicha(mascotaId: number): void {
    this.router.navigate(['/paciente/ficha', mascotaId]);
  }
}
