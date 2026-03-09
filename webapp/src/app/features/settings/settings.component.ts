import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FlatsService } from '../../flats/flats.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="settings-container">
      <h2>Ustawienia ⚙️</h2>

      <div class="cards-layout">
        <div class="card">
          <h3>Zarządzanie mieszkaniem 🏠</h3>
          <div *ngIf="flatData">
            <p>Nazwa: <strong>{{ flatData.name }}</strong></p>
            <div class="code-box">
              <p>Obecny kod zaproszenia:</p>
              <h1 class="code">{{ flatData.code }}</h1>
            </div>
            <p class="warning-text">
              Jeśli Twój kod wpadł w niepowołane ręce lub ktoś z ekipy się wyprowadził, możesz wygenerować nowy. Stary przestanie działać!
            </p>
            <button class="btn-warning" (click)="generateNewCode()">🔄 Wygeneruj nowy kod</button>
          </div>
          <p *ngIf="!flatData">Ładowanie danych mieszkania...</p>
        </div>

        <div class="card danger-zone">
          <h3>Konto 👤</h3>
          <p>Chcesz opuścić aplikację?</p>
          <button class="btn-danger" (click)="logout()">🚪 Wyloguj się</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-container { padding: 20px; max-width: 800px; font-family: sans-serif; }
    .settings-container h2 { font-size: 2rem; color: #333; margin-bottom: 20px; }
    .cards-layout { display: flex; gap: 20px; flex-wrap: wrap; align-items: flex-start; }
    .card { flex: 1; min-width: 300px; background: white; border: 1px solid #ddd; border-radius: 8px; padding: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .code-box { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; border: 2px dashed #ccc; margin: 15px 0; }
    .code { font-size: 2.5rem; letter-spacing: 5px; color: #007bff; margin: 10px 0 0 0; }
    .warning-text { font-size: 0.85rem; color: #666; margin-bottom: 15px; }
    
    button { padding: 10px 20px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 1rem; width: 100%; transition: opacity 0.2s;}
    button:hover { opacity: 0.8; }
    .btn-warning { background-color: #ffc107; color: #212529; }
    .btn-danger { background-color: #dc3545; color: white; margin-top: 15px;}
    
    .danger-zone { border-color: #f5c6cb; background-color: #fff9f9; }
  `]
})
export class SettingsComponent implements OnInit {
  flatData: any = null;

  constructor(
    private flatsService: FlatsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.flatsService.getMyFlat().subscribe({
      next: (data) => this.flatData = data
    });
  }

  generateNewCode() {
    if(confirm('⚠️ UWAGA! Wygenerowanie nowego kodu sprawi, że nikt nie dołączy już przy użyciu starego. Jesteś pewien?')) {
      this.flatsService.generateNewCode().subscribe({
        next: (response) => {
          alert('Wygenerowano nowy kod!');
          this.flatData.code = response.code; // Aktualizujemy widok nowym kodem z backendu
        },
        error: () => alert('Błąd podczas generowania kodu.')
      });
    }
  }

  logout() {
    this.authService.logout(); // Czyścimy token
    this.router.navigate(['/login']); // Wyrzucamy użytkownika na ekran logowania
  }
}