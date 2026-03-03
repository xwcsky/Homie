import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Dla *ngFor, *ngIf
import { FormsModule } from '@angular/forms';   // Dla [(ngModel)]
import { ChoresService } from 'src/app/chores/chores.service';
import { Chore } from './chores.model';
@Component({
  selector: 'app-chores',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  template: `
    <div class="container">
      <h2>Lista Obowiązków 🧹</h2>

      <div class="add-box">
        <input 
          type="text" 
          [(ngModel)]="newChoreTitle" 
          placeholder="Co trzeba zrobić? (np. Wynieś śmieci)"
          (keyup.enter)="add()"
        >
        <button (click)="add()">Dodaj</button>
      </div>

      <ul class="chore-list">
        <li *ngFor="let chore of chores" [class.done]="chore.isDone">
          
          <input 
            type="checkbox" 
            [checked]="chore.isDone" 
            (change)="toggle(chore)"
          >
          
          <span class="title">{{ chore.title }}</span>

          <span *ngIf="chore.assignedTo" class="assignee">
            👤 {{ chore.assignedTo.name }}
          </span>

          <button class="delete-btn" (click)="remove(chore.id)">🗑️</button>
        </li>
      </ul>
      
      <p *ngIf="chores.length === 0">Brak zadań! Chyba można odpocząć. 🎉</p>
    </div>
  `,
  styles: [`
    .container { padding: 20px; max-width: 500px; font-family: sans-serif; }
    .add-box { display: flex; gap: 10px; margin-bottom: 20px; }
    input[type=text] { flex: 1; padding: 8px; }
    .chore-list { list-style: none; padding: 0; }
    .chore-list li { 
      display: flex; align-items: center; gap: 10px; 
      padding: 10px; border-bottom: 1px solid #eee; 
    }
    .chore-list li.done .title { text-decoration: line-through; color: #888; }
    .delete-btn { margin-left: auto; background: none; border: none; cursor: pointer; }
    .assignee { font-size: 0.8em; color: #666; background: #eee; padding: 2px 6px; border-radius: 4px; }
  `]
})
export class ChoresBoardComponent implements OnInit {
  chores: Chore[] = [];
  newChoreTitle = '';

  constructor(private choresService: ChoresService) {}

  ngOnInit() {
    this.loadChores();
  }

  loadChores() {
    this.choresService.getChores().subscribe(data => {
      this.chores = data;
    });
  }

  add() {
    if (!this.newChoreTitle.trim()) return;

    this.choresService.addChore(this.newChoreTitle).subscribe(newChore => {
      this.chores.push(newChore); // Dodaj do listy lokalnie
      this.newChoreTitle = '';    // Wyczyść input
    });
  }

  toggle(chore: Chore) {
    const newState = !chore.isDone;
    // Opcjonalnie: Optymistyczna aktualizacja UI (szybciej dla oka)
    chore.isDone = newState; 

    this.choresService.toggleChore(chore.id, newState).subscribe({
      error: () => {
        // Jak serwer zwróci błąd, cofamy zmianę
        chore.isDone = !newState;
        alert('Nie udało się zmienić statusu!');
      }
    });
  }

  remove(id: number) {
    if(!confirm('Na pewno usunąć?')) return;
    
    this.choresService.deleteChore(id).subscribe(() => {
      // Usuń z listy lokalnie
      this.chores = this.chores.filter(c => c.id !== id);
    });
  }
}