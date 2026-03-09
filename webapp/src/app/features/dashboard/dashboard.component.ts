import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Router } from '@angular/router';
import { FlatsService } from 'src/app/flats/flats.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1>Panel Główny 🏠</h1>

      <div *ngIf="!flatData && !errorMessage">
        <p>📡 Łączenie z bazą...</p>
      </div>

      <div *ngIf="errorMessage" style="color: red;">
        <p>⚠️ {{ errorMessage }}</p>
      </div>

      <div *ngIf="flatData" style="border: 1px solid #ccc; padding: 15px; border-radius: 8px;">
        <h2>{{ flatData.name }}</h2>
        <p><strong>Kod zaproszenia:</strong> <span style="background: #eee; padding: 5px;">{{ flatData.code }}</span></p>
        
        <h3>Mieszkańcy:</h3>
        <ul>
          <li *ngFor="let member of flatData.memberships">
            {{ member.user.name }} ({{ member.user.email }})
            <span *ngIf="member.role === 'ADMIN'">👑</span>
          </li>
        </ul>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  flatData: any = null;
  errorMessage = '';

  constructor(private flatsService: FlatsService, private router: Router) {}

  ngOnInit() {
    this.flatsService.getMyFlat().subscribe({
      next: (data) => {
        if (!data) {
          this.router.navigate(['/onboarding']);
        } else {
          this.flatData = data;
        }
      },
      error: (error) => {
        console.error('Błąd:', error);
        this.router.navigate(['/onboarding']);
      }
    });
  }
}