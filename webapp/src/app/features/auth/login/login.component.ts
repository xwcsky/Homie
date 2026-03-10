import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { ToastService } from 'src/app/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'] 
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);
  toastService = inject(ToastService);


  email = '';
  password = '';
  errorMessage = '';

  onSubmit() {
    // Resetujemy błąd przy nowej próbie
    this.errorMessage = '';
    
    const credentials = { email: this.email, password: this.password };
    
    this.authService.login(credentials).subscribe({
      next: () => {
        this.toastService.show('Zalogowano! 🎉', 'success');
        this.router.navigate(['/dashboard']); 
      },
      error: (err) => {
        console.error('Błąd logowania', err);
        this.toastService.show('Niepoprawny email lub hasło!', 'error');
      }
    });
  }
}