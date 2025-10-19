import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  isExpanded = false;
  username: string = 'Usuario';
  userRole: string = 'Rol no definido';
  private userRoles: string[] = [];
  showLogoutConfirmModal = false;

  @Output() expansionStateChanged = new EventEmitter<boolean>();

  constructor(private router: Router) { }

  ngOnInit(): void {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        const decodedToken: { sub: string, roles: string } = jwtDecode(token);
        this.username = decodedToken.sub;
        const rolesString = decodedToken.roles || '';
        this.userRoles = rolesString.split(',');
        const primaryRole = this.userRoles.includes('ROL_ADMINISTRADOR') ? 'ROL_ADMINISTRADOR' : this.userRoles[0];
        this.userRole = this.formatRoleName(primaryRole);
      } catch (error) {
        console.error("Error al decodificar el token", error);
        this.confirmLogout();
      }
    }
  }

  expand(): void {
    this.isExpanded = true;
    this.expansionStateChanged.emit(true);
  }

  collapse(): void {
    this.isExpanded = false;
    this.expansionStateChanged.emit(false);
  }

  hasRole(requiredRoles: string[]): boolean {
    return requiredRoles.some(role => this.userRoles.includes(role));
  }

  logout(): void {
    this.showLogoutConfirmModal = true;
  }

  cancelLogout(): void {
    this.showLogoutConfirmModal = false;
  }

  confirmLogout(): void {
    localStorage.removeItem('jwt_token');
    this.showLogoutConfirmModal = false;
    this.router.navigate(['/login']);
  }

  private formatRoleName(role: string): string {
    if (!role) return 'Sin Rol';
    switch (role) {
      case 'ROL_ADMINISTRADOR': return 'Administrador';
      case 'ROL_RECEPCIONISTA': return 'Recepcionista';
      case 'ROL_VETERINARIO': return 'Veterinario';
      case 'ROL_GROOMING': return 'Grooming';
      default:
        return role.replace('ROL_', '').charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    }
  }
}

