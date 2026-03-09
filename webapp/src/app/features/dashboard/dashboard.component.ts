import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Router } from '@angular/router';
import { FlatsService } from 'src/app/flats/flats.service';
import { ChoresService } from 'src/app/chores/chores.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div style="padding: 20px; font-family: sans-serif;">
    <h1>Witaj w domu! 🏠</h1>
    
    <div *ngIf="flatData" class="dashboard-grid">
      <div class="card">
        <h2>{{ flatData.name }}</h2>
        <p>Kod zaproszenia: <strong>{{ flatData.code }}</strong></p>
        <h3>Lokatorzy:</h3>
        <ul>
          <li *ngFor="let member of flatData.memberships">
            {{ member.user.name }} 
            <span *ngIf="member.role === 'ADMIN'">👑</span>
          </li>
        </ul>
      </div>

      <div class="card today-card">
        <h2>🔥 Zadania na dziś</h2>
        <ul class="today-list">
          <li *ngFor="let chore of todayChores" [class.done]="chore.isDone">
            <label>
              <input type="checkbox" [checked]="chore.isDone" disabled> {{ chore.title }}
            </label>
            <span class="user-badge" *ngIf="chore.assignedTo">
              👤 {{ chore.assignedTo.name }}
            </span>
          </li>
        </ul>
        <p *ngIf="todayChores.length === 0" style="color: #28a745; font-weight: bold;">
          Brak zadań na dziś! Czysty luz. 🛋️
        </p>
      </div>
    </div>
  </div>
`,
styles: [`
  .dashboard-grid { display: flex; gap: 20px; flex-wrap: wrap; margin-top: 20px;}
  .card { flex: 1; min-width: 300px; border: 1px solid #ccc; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
  .today-card { background-color: #fff9e6; border-color: #ffeeba; }
  .today-list { list-style: none; padding: 0; }
  .today-list li { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #f5c6cb; }
  .today-list li.done { opacity: 0.5; text-decoration: line-through; }
  .user-badge { font-size: 0.8rem; background: white; padding: 2px 6px; border-radius: 4px; border: 1px solid #ccc; }
`]
})
export class DashboardComponent implements OnInit {
  flatData: any = null;
  errorMessage = '';
  todayChores: any[] = []; 

  constructor(private flatsService: FlatsService, private router: Router, private choresService: ChoresService,) {}

  ngOnInit() {
    this.flatsService.getMyFlat().subscribe({
      next: (data) => {
        if (!data) {
          this.router.navigate(['/onboarding']);
        } else {
          this.flatData = data;
          this.loadTodayChores();
        }
      },
      error: (error) => {
        console.error('Błąd:', error);
        this.router.navigate(['/onboarding']);
      }
    });
  }

  loadTodayChores() {
    // 1. Wyciągamy dzisiejszą datę w formacie YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    // 2. Pobieramy wszystkie zadania
    this.choresService.getChores().subscribe(chores => {
      // 3. Filtrujemy tylko te, które mają datę z dzisiaj!
      this.todayChores = chores.filter(c => {
        if (!c.date) return false; // Zadania "kiedykolwiek" pomijamy na tej karcie
        const choreDate = new Date(c.date).toISOString().split('T')[0];
        return choreDate === today;
      });
    });
  }
}