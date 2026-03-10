import { Component, OnInit, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinancesService } from 'src/app/finances/finances.service';
import { ConfirmService } from 'src/app/confirm.service';
import { ToastService } from 'src/app/toast.service';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.scss']
})
export class ExpenseListComponent implements OnInit {
  // 1. Zmieniamy typy na "any[]", żeby odblokować HTML i uniknąć konfliktów z Twoim starym plikiem 'bill-model'
  bills: any[] = [];
  summary: any[] = [];

  // 2. Zmieniamy nazwy zmiennych, żeby HTML je bez problemu znalazł
  newBillName = '';
  newBillAmount: number | null = null;
  confirmService = inject(ConfirmService);
  toastService = inject(ToastService);

  constructor(private financesService: FinancesService) {}

  ngOnInit() {
    this.refreshData();
  }

  refreshData() {
    // Pobieramy rachunki
    this.financesService.getBills().subscribe(data => {
      this.bills = data.map((b: any) => ({
        ...b,
        name: b.title || b.name
      }));
    });
    
    // Pobieramy podsumowanie długów
    this.financesService.getSummary().subscribe(data => {
       console.log('Zerkamy co przychodzi z backendu:', data); // <--- Nasz szpieg 🕵️‍♂️
       
       // Próbujemy wyciągnąć listę na kilka sposobów:
       if (Array.isArray(data)) {
         this.summary = data; // Opcja A: przyszła gotowa lista
       } else if (data && data.balances) {
         this.summary = data.balances; // Opcja B: lista była schowana w "balances"
       } else {
         this.summary = []; // Jeśli to obiekt innej maści, na razie dajemy pustą listę
       }
    });
  }

  addBill() {
    if (!this.newBillName || !this.newBillAmount) return;

    // Przekazujemy zmienne do Twojego serwisu
    this.financesService.addBill(this.newBillName, this.newBillAmount).subscribe(() => {
      this.newBillName = '';
      this.newBillAmount = null;
      this.refreshData(); 
    });
  }

  async clearDebts() {
    
    // Zamiast confirm(), używamy naszego serwisu z słówkiem 'await' (poczekaj na kliknięcie)
    const isConfirmed = await this.confirmService.ask(
      'Wyzerowanie długów', // Tytuł
      'Czy na pewno rozliczyliście się w gotówce/Blikiem? Ta akcja bezpowrotnie usunie wszystkie rachunki i wyzeruje bilanse!', // Wiadomość
      'Tak, wyzeruj', // Tekst czerwonego przycisku
      'Anuluj'        // Tekst szarego przycisku
    );
    
    // Jeśli kliknął "Tak" (true)
    if (isConfirmed) {
      this.financesService.clearDebts().subscribe({
        next: () => {
          this.toastService.show('Miesiąc zakończony! Długi wyzerowane. 🍻', 'success');
          this.refreshData(); 
        },
        error: () => this.toastService.show('Nie udało się wyzerować długów. 🚨', 'error')
      });
    }
  }
}