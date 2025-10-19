import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  credentials = {
    username: '',
    password: ''
  };
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    this.errorMessage = null;
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        localStorage.setItem('jwt_token', response.token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = 'Credenciales incorrectas. Por favor, intente de nuevo.';
      }
    });
  }
}