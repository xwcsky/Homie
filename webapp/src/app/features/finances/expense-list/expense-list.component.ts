import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinancesService } from 'src/app/finances/finances.service';
import { Bill, Summary } from './bill-model';

@Component({
  selector: 'app-finances',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h1>Finanse Domowe 💰</h1>

      <div class="summary-card" *ngIf="summary">
        <h3>📊 Bilans</h3>
        <p>W sumie wydano: <strong>{{ summary.totalSpent }} zł</strong></p>
        <p>Na głowę wychodzi: <strong>{{ summary.perPerson }} zł</strong></p>
        
        <div class="balances">
          <div *ngFor="let bal of summary.balances" class="balance-row" 
               [class.plus]="bal.balance >= 0" 
               [class.minus]="bal.balance < 0">
            <span>👤 {{ bal.name }}</span>
            <span class="amount">
              {{ bal.balance > 0 ? 'Odzyska' : 'Musi oddać' }}: 
              <strong>{{ bal.balance | number:'1.2-2' }} zł</strong>
            </span>
          </div>
        </div>
      </div>

      <hr>

      <div class="add-box">
        <input type="text" [(ngModel)]="newTitle" placeholder="Co kupiłeś? (np. Pizza)" class="input-title">
        <input type="number" [(ngModel)]="newAmount" placeholder="Kwota" class="input-amount">
        <button (click)="addBill()">Dodaj</button>
      </div>

      <h3>Ostatnie wydatki:</h3>
      <ul class="bill-list">
        <li *ngFor="let bill of bills">
          <div class="bill-info">
            <strong>{{ bill.title }}</strong>
            <small>Płacił: {{ bill.payer.name }}</small>
          </div>
          <div class="bill-price">
            {{ bill.amount }} zł
          </div>
        </li>
      </ul>
      
      <p *ngIf="bills.length === 0">Brak wydatków. Tanio żyjecie! 🤑</p>
    </div>
  `,
  styles: [`
    .container { padding: 20px; max-width: 600px; font-family: sans-serif; }
    
    /* Style dla Podsumowania */
    .summary-card { background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #ddd; margin-bottom: 20px; }
    .balance-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .plus { color: green; } /* Ktoś jest na plusie */
    .minus { color: red; }   /* Ktoś jest na minusie */

    /* Style dla Dodawania */
    .add-box { display: flex; gap: 10px; margin-bottom: 20px; }
    .input-title { flex: 2; padding: 8px; }
    .input-amount { flex: 1; padding: 8px; }

    /* Style dla Listy */
    .bill-list { list-style: none; padding: 0; }
    .bill-list li { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; align-items: center; }
    .bill-price { font-weight: bold; font-size: 1.1em; }
  `]
})
export class ExpenseListComponent implements OnInit {
  bills: Bill[] = [];
  summary: Summary | null = null;

  newTitle = '';
  newAmount: number | null = null;

  constructor(private financesService: FinancesService) {}

  ngOnInit() {
    this.refreshData();
  }

  refreshData() {
    // Pobieramy listę rachunków
    this.financesService.getBills().subscribe(data => this.bills = data);
    
    // ORAZ pobieramy podsumowanie (kto komu wisi)
    this.financesService.getSummary().subscribe(data => this.summary = data);
  }

  addBill() {
    if (!this.newTitle || !this.newAmount) return;

    this.financesService.addBill(this.newTitle, this.newAmount).subscribe(() => {
      // Po dodaniu czyścimy formularz i odświeżamy WSZYSTKO
      this.newTitle = '';
      this.newAmount = null;
      this.refreshData(); // Kluczowe! Żeby od razu zaktualizował się bilans
    });
  }
}