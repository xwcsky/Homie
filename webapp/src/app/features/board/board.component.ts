import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlatsService } from '../../flats/flats.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="board-container">
      <div class="header-action">
        <h2>Tablica Ogłoszeń 📌</h2>
        <button class="btn-save" (click)="saveBoard()">💾 Zapisz zmiany</button>
      </div>
      <p class="subtitle">Wszystko, co ważne dla domowników, w jednym miejscu.</p>

      <div class="cork-board">
        
        <div class="sticky-note yellow">
          <h3>📶 Hasło Wi-Fi</h3>
          <input type="text" [(ngModel)]="boardData.wifiPassword" placeholder="Wpisz nazwę sieci i hasło...">
        </div>

        <div class="sticky-note blue">
          <h3>💸 Numer konta (Czynsz)</h3>
          <textarea [(ngModel)]="boardData.bankAccount" placeholder="Wklej tu numer konta właściciela..."></textarea>
        </div>

        <div class="sticky-note pink">
          <h3>📜 Ważne zasady / Notatki</h3>
          <textarea [(ngModel)]="boardData.boardNotes" placeholder="np. Wyrzucamy śmieci, gdy kosz jest pełny. Cisza nocna od 22:00."></textarea>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .board-container { padding: 20px; max-width: 900px; font-family: sans-serif; }
    .header-action { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
    .header-action h2 { margin: 0; font-size: 2rem; color: #333; }
    .subtitle { color: #666; margin-bottom: 30px; }
    .btn-save { background-color: #28a745; color: white; border: none; padding: 12px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: background 0.2s;}
    .btn-save:hover { background-color: #218838; }

    /* Tablica korkowa i karteczki */
    .cork-board { display: flex; gap: 30px; flex-wrap: wrap; justify-content: center; padding: 20px 0; }
    
    .sticky-note {
      width: 250px;
      min-height: 250px;
      padding: 20px;
      border-radius: 2px 15px 2px 15px;
      box-shadow: 2px 8px 15px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      position: relative;
    }
    
    /* Dodajemy pinezkę na środku karteczki */
    .sticky-note::before {
      content: "📍";
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 1.5rem;
    }

    .sticky-note h3 { margin-top: 5px; font-size: 1.2rem; border-bottom: 1px dashed rgba(0,0,0,0.2); padding-bottom: 10px; color: #333;}
    .sticky-note input, .sticky-note textarea { 
      flex: 1; border: none; background: transparent; font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif; font-size: 1rem; resize: none; outline: none; margin-top: 10px; line-height: 1.5; color: #222;
    }

    /* Kolory i lekkie przechylenie karteczek */
    .yellow { background: #fff740; transform: rotate(-2deg); }
    .blue { background: #73d5fa; transform: rotate(1deg); }
    .pink { background: #ffb3d9; transform: rotate(-1deg); }
    
    .sticky-note:focus-within { transform: scale(1.05); z-index: 10; box-shadow: 4px 12px 25px rgba(0,0,0,0.2); transition: transform 0.2s ease-in-out; }
  `]
})
export class BoardComponent implements OnInit {
  boardData = {
    wifiPassword: '',
    bankAccount: '',
    boardNotes: ''
  };

  constructor(private flatsService: FlatsService) {}

  ngOnInit() {
    // Przy wejściu w zakładkę pobieramy obecne dane z bazy
    this.flatsService.getMyFlat().subscribe({
      next: (flat) => {
        if (flat) {
          this.boardData.wifiPassword = flat.wifiPassword || '';
          this.boardData.bankAccount = flat.bankAccount || '';
          this.boardData.boardNotes = flat.boardNotes || '';
        }
      }
    });
  }

  saveBoard() {
    this.flatsService.updateBoard(this.boardData).subscribe({
      next: () => alert('Tablica została zaktualizowana! 📌'),
      error: () => alert('Nie udało się zapisać zmian na tablicy.')
    });
  }
}