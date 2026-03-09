import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { AuthService } from 'src/app/auth/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], 
  template: `
    <div class="login-container">
      <h2>Zaloguj się do Homie 🏠</h2>
      
      <form (ngSubmit)="onSubmit()">
        <div>
          <label>Email:</label>
          <input type="email" [(ngModel)]="email" name="email" required>
        </div>
        
        <div>
          <label>Hasło:</label>
          <input type="password" [(ngModel)]="password" name="password" required>
        </div>

        <button type="submit">Wejdź</button>
      </form>
      
      <p *ngIf="errorMessage" style="color: red">{{ errorMessage }}</p>

     <div style="margin-top: 20px; text-align: center; border-top: 1px solid #eee; padding-top: 15px;">
     Nie masz jeszcze konta? <a routerLink="/register" style="color: #007bff; font-weight: bold; text-decoration: none;">Zarejestruj się</a>
     </div>
    </div>
  `,
  styles: [`
    .login-container { padding: 20px; max-width: 400px; margin: 0 auto; }
    input { display: block; margin-bottom: 10px; width: 100%; padding: 8px; }
    button { padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer; }
  `]
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);

  email = '';
  password = '';
  errorMessage = '';

  onSubmit() {
    const credentials = { email: this.email, password: this.password };
    
    this.authService.login(credentials).subscribe({
      next: (res) => {
        console.log('Zalogowano!', res);
        // Przekieruj na Dashboard po udanym logowaniu
        this.router.navigate(['/dashboard']); 
      },
      error: (err) => {
        console.error('Błąd logowania', err);
        this.errorMessage = 'Niepoprawny email lub hasło!';
      }
    });
  }
}