import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // RouterModule potrzebny do linków
import { AuthService } from '../../../auth/auth.service'; // Ścieżka do Twojego AuthService

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <h2>Zarejestruj się w Homie 📝</h2>
      
      <form (ngSubmit)="onSubmit()">
        <div>
          <label>Imię (jak mają Cię widzieć ziomki):</label>
          <input type="text" [(ngModel)]="name" name="name" required placeholder="np. Ania">
        </div>

        <div>
          <label>Email:</label>
          <input type="email" [(ngModel)]="email" name="email" required>
        </div>
        
        <div>
          <label>Hasło:</label>
          <input type="password" [(ngModel)]="password" name="password" required>
        </div>

        <button type="submit" class="btn-primary">Załóż konto</button>
      </form>
      
      <p *ngIf="errorMessage" class="error">{{ errorMessage }}</p>

      <div class="toggle-view">
        Masz już konto? <a routerLink="/login">Zaloguj się</a>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { padding: 30px; max-width: 400px; margin: 40px auto; border: 1px solid #ddd; border-radius: 8px; font-family: sans-serif; box-shadow: 0 4px 6px rgba(0,0,0,0.1); background: white; }
    input { display: block; margin-top: 5px; margin-bottom: 15px; width: 100%; padding: 10px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; }
    button { padding: 10px 20px; width: 100%; border: none; cursor: pointer; border-radius: 4px; font-size: 1rem; font-weight: bold; }
    .btn-primary { background: #28a745; color: white; }
    .btn-primary:hover { background: #218838; }
    .error { color: red; margin-top: 10px; text-align: center; }
    .toggle-view { margin-top: 20px; text-align: center; font-size: 0.9rem; border-top: 1px solid #eee; padding-top: 15px; }
    .toggle-view a { color: #007bff; text-decoration: none; font-weight: bold; }
  `]
})
export class RegisterComponent {
  authService = inject(AuthService);
  router = inject(Router);

  name = '';
  email = '';
  password = '';
  errorMessage = '';

  onSubmit() {
    // Backend oczekuje name, email i password
    const data = { name: this.name, email: this.email, password: this.password };
    
    this.authService.register(data).subscribe({
      next: () => {
        alert('Konto zostało utworzone! Możesz się teraz zalogować.');
        // Po udanej rejestracji wyrzucamy na login
        this.router.navigate(['/login']); 
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = err.error?.message || 'Błąd rejestracji. Taki email może już istnieć.';
      }
    });
  }
}