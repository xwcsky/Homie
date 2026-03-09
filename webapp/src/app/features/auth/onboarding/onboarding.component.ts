import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FlatsService } from '../../../flats/flats.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="onboarding-container">
      <h1>Witaj w Homie! 🏠</h1>
      <p>Wygląda na to, że nie należysz jeszcze do żadnego mieszkania.</p>

      <div class="cards">
        <div class="card">
          <h3>Dołącz do ekipy 👯‍♂️</h3>
          <p>Masz kod zaproszenia od znajomych?</p>
          <input type="text" [(ngModel)]="joinCode" placeholder="Wpisz 6-znakowy kod" />
          <button (click)="join()">Dołącz</button>
        </div>

        <div class="divider">ALBO</div>

        <div class="card">
          <h3>Zostań Adminem 👑</h3>
          <p>Załóż nowe mieszkanie i zaproś innych.</p>
          <input type="text" [(ngModel)]="newFlatName" placeholder="Nazwa (np. Studenckie 404)" />
          <button (click)="create()" class="btn-primary">Stwórz</button>
        </div>
      </div>

      <p *ngIf="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  `,
  styles: [`
    .onboarding-container { text-align: center; padding: 40px 20px; font-family: sans-serif; }
    .cards { display: flex; justify-content: center; gap: 20px; margin-top: 30px; align-items: stretch; }
    .card { border: 1px solid #ccc; border-radius: 8px; padding: 20px; width: 300px; display: flex; flex-direction: column; justify-content: space-between; }
    .divider { display: flex; align-items: center; font-weight: bold; color: #888; }
    input { padding: 10px; margin-bottom: 15px; font-size: 1rem; width: 100%; box-sizing: border-box; }
    button { padding: 10px; font-size: 1rem; cursor: pointer; border: none; border-radius: 4px; background: #eee; }
    .btn-primary { background: #007bff; color: white; }
    .error { color: red; margin-top: 20px; font-weight: bold; }
  `]
})
export class OnboardingComponent {
  joinCode = '';
  newFlatName = '';
  errorMessage = '';

  constructor(private flatsService: FlatsService, private router: Router) {}

  join() {
    if (!this.joinCode) return;
    this.flatsService.joinFlat(this.joinCode).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => this.errorMessage = err.error?.message || 'Nie udało się dołączyć (zły kod?)'
    });
  }

  create() {
    if (!this.newFlatName) return;
    this.flatsService.createFlat(this.newFlatName).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => this.errorMessage = 'Nie udało się stworzyć mieszkania.'
    });
  }
}