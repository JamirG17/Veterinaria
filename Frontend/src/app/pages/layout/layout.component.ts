import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [ CommonModule, RouterModule, SidebarComponent ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  isSidebarExpanded = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Redirige solo si el usuario acaba de iniciar sesión y está en la raíz
    if (this.router.url === '/dashboard' || this.router.url === '/') {
      this.redireccionarPorRol();
    }
  }

  onSidebarExpansionChanged(isExpanded: boolean): void {
    this.isSidebarExpanded = isExpanded;
  }

  /**
   * Redirige al usuario a su dashboard principal según su rol.
   * Da prioridad a Recepcionista/Admin sobre Grooming.
   */
  private redireccionarPorRol(): void {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        const decodedToken: { sub: string, roles: string } = jwtDecode(token);
        const roles = decodedToken.roles.split(',');

        if (roles.includes('ROL_ADMINISTRADOR') || roles.includes('ROL_RECEPCIONISTA')) {
          this.router.navigate(['/dashboard']);
        } else if (roles.includes('ROL_VETERINARIO')) {
          this.router.navigate(['/veterinario-dashboard']);
        } else if (roles.includes('ROL_GROOMING')) {
          this.router.navigate(['/grooming-dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      } catch (error) { /* ... */ }
    }
  }
}

