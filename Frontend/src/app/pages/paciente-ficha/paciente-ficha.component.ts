import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { PacienteDetalle, Prevencion } from '../../models/api-models';
import { PacienteService } from '../../services/paciente.service';
import { MascotaService } from '../../services/mascota.service';
import { PrevencionService } from '../../services/prevencion.service';

@Component({
  selector: 'app-paciente-ficha',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './paciente-ficha.component.html',
  styleUrls: ['./paciente-ficha.component.scss']
})
export class PacienteFichaComponent implements OnInit {

  detalle: PacienteDetalle | null = null;
  activeTab: 'clinico' | 'grooming' | 'citas' = 'clinico';

  isEditingAlergias = false;
  alergiasOriginales: string | undefined = '';

  showPrevencionModal = false;
  nuevaPrevencion: Partial<Prevencion> = {};

  // --- NUEVA PROPIEDAD PARA CONTROLAR EL ACORDEÓN ---
  registroExpandidoId: number | null = null;
  groomingExpandidoId: number | null = null;
  citaExpandidaId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private pacienteService: PacienteService,
    private mascotaService: MascotaService,
    private prevencionService: PrevencionService,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarDetalle(+id);
    }
  }

  cargarDetalle(mascotaId: number): void {
    this.pacienteService.getDetalleCompleto(mascotaId).subscribe(data => {
      this.detalle = data;
      this.cdr.markForCheck();
    });
  }

  // --- NUEVOS MÉTODOS PARA EL ACORDEÓN ---
  toggleHistorial(id: number): void {
    this.registroExpandidoId = this.registroExpandidoId === id ? null : id;
  }
  toggleGrooming(id: number): void {
    this.groomingExpandidoId = this.groomingExpandidoId === id ? null : id;
  }
  toggleCita(id: number): void {
    this.citaExpandidaId = this.citaExpandidaId === id ? null : id;
  }
  
  setTab(tab: 'clinico' | 'grooming' | 'citas'): void {
    this.activeTab = tab;
  }

  // --- Métodos para Alergias ---
  activarEdicionAlergias(): void {
    this.alergiasOriginales = this.detalle?.mascota.alergias;
    this.isEditingAlergias = true;
  }

  cancelarEdicionAlergias(): void {
    if (this.detalle) {
      this.detalle.mascota.alergias = this.alergiasOriginales;
    }
    this.isEditingAlergias = false;
  }

  guardarAlergias(): void {
    if (!this.detalle) return;
    const mascota = this.detalle.mascota;
    this.mascotaService.updateAlergias(mascota.id, mascota.alergias || '').subscribe(() => {
      this.isEditingAlergias = false;
      this.cdr.markForCheck();
    });
  }

  // --- Métodos para Prevenciones (Vacunas/Desparasitación) ---
  abrirModalPrevencion(tipo: string): void {
    this.nuevaPrevencion = {
      tipo: tipo,
      producto: '',
      fechaAplicacion: new Date().toISOString().split('T')[0]
    };
    this.showPrevencionModal = true;
  }

  cerrarModalPrevencion(): void {
    this.showPrevencionModal = false;
  }

  guardarPrevencion(form: NgForm): void {
    if (form.invalid || !this.detalle) return;
    this.prevencionService.addPrevencion(this.detalle.mascota.id, this.nuevaPrevencion).subscribe(() => {
      this.cargarDetalle(this.detalle!.mascota.id);
      this.cerrarModalPrevencion();
    });
  }

  eliminarPrevencion(prevencionId: number): void {
    if (confirm('¿Está seguro de que desea eliminar este registro?')) {
      this.prevencionService.deletePrevencion(prevencionId).subscribe(() => {
        this.cargarDetalle(this.detalle!.mascota.id);
      });
    }
  }

  // --- Métodos de Ayuda ---
  get vacunas(): Prevencion[] {
    return this.detalle?.prevenciones.filter(p => p.tipo === 'VACUNA') || [];
  }

  get desparasitaciones(): Prevencion[] {
    return this.detalle?.prevenciones.filter(p => p.tipo.startsWith('DESPARASITACION')) || [];
  }

  calcularEdad(fechaNacimiento: string): string {
    if (!fechaNacimiento) return 'N/A';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    return edad >= 1 ? `${edad} años` : 'Menos de 1 año';
  }

  regresar(): void {
    this.location.back();
  }
}