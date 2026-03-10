import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FlatsService } from '../../flats/flats.service';
import { ChoresService } from '../../chores/chores.service';
import { FormsModule } from '@angular/forms';
import { ToastService } from 'src/app/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  flatData: any = null;
  todayChores: any[] = [];
  toastService = inject(ToastService);


  // Zmienne dla naszej lodówki/tablicy
  boardData = { wifiPassword: '', bankAccount: '', boardNotes: '' };
  isSaving = false;

  constructor(
    private flatsService: FlatsService,
    private choresService: ChoresService,
    private router: Router
  ) {}

  ngOnInit() {
    this.flatsService.getMyFlat().subscribe({
      next: (data) => {
        if (!data) {
          this.router.navigate(['/onboarding']);
        } else {
          this.flatData = data;
          // Przepisujemy dane z bazy na nasze karteczki
          this.boardData.wifiPassword = data.wifiPassword || '';
          this.boardData.bankAccount = data.bankAccount || '';
          this.boardData.boardNotes = data.boardNotes || '';
          
          this.loadTodayChores();
        }
      },
      error: () => this.router.navigate(['/onboarding'])
    });
  }

  loadTodayChores() {
    const today = new Date().toISOString().split('T')[0];
    this.choresService.getChores().subscribe(chores => {
      this.todayChores = chores.filter(c => {
        if (!c.date) return false;
        const choreDate = new Date(c.date).toISOString().split('T')[0];
        return choreDate === today;
      });
    });
  }

  // Funkcja zapisująca karteczki
  saveBoard() {
    this.isSaving = true;
    this.flatsService.updateBoard(this.boardData).subscribe({
      next: () => {
        this.isSaving = false;
        // Mały trik UX - chwilowa zmiana tekstu po zapisie (opcjonalne, ale fajne)
        this.toastService.show('Lodówka zaktualizowana! 📌', 'success');
      },
      error: () => {
        this.isSaving = false;
        this.toastService.show('Nie udało się zapisać. Spróbuj ponownie. 🚨', 'error');
      }
    });
  }
}