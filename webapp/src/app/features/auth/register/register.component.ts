import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { ToastService } from 'src/app/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  authService = inject(AuthService);
  router = inject(Router);
  toastService = inject(ToastService);

  name = '';
  email = '';
  password = '';
  errorMessage = '';

  onSubmit() {
    this.errorMessage = ''; // Czyścimy stary błąd przed nową próbą
    
    // Backend oczekuje name, email i password
    const data = { name: this.name, email: this.email, password: this.password };
    
    this.authService.register(data).subscribe({
      next: () => {
        this.toastService.show('Konto utworzone! Zaloguj się. 🎉', 'success');
        this.router.navigate(['/login']); 
      },
      error: () => {
        this.toastService.show('Błąd rejestracji. Taki email może już istnieć', 'error');
      }
    });
  }
}