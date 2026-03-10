import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShoppingService, ShoppingItem } from '../shopping.service';
import { PromptService } from 'src/app/prompt.service';
import { ToastService } from 'src/app/toast.service';


@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: `./shopping-list.component.html`,
  styleUrls: [`./shopping-list.component.scss`]
})
export class ShoppingListComponent implements OnInit {
  items: ShoppingItem[] = [];
  newItemName = '';
  toastService = inject(ToastService);
  promptService = inject(PromptService);

  constructor(private shoppingService: ShoppingService) {}

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.shoppingService.getItems().subscribe(data => this.items = data);
  }

  add() {
    if (!this.newItemName.trim()) return;
    this.shoppingService.addItem(this.newItemName).subscribe(() => {
      this.newItemName = '';
      this.loadItems();
    });
  }

  toggle(item: ShoppingItem) {
    const newState = !item.isBought;
    this.shoppingService.toggleItem(item.id, newState).subscribe(() => {
      this.loadItems(); // Odświeżamy z backendu, żeby pobrać imię kupującego
    });
  }

  remove(id: number) {
    if(!confirm('Na pewno usunąć z listy?')) return;
    this.shoppingService.deleteItem(id).subscribe(() => this.loadItems());
  }

  // NASZ KILLER FEATURE
  async convertToBill(item: any) { // Zmień 'any' na swój 'ShoppingItem'
  
    // Zamiast prompt(), wywołujemy nasz nowy, elegancki modal! (czekamy na odpowiedź dzięki 'await')
    const amountStr = await this.promptService.ask(
      'Rozlicz zakup', // Tytuł modala
      `Ile kosztowało: "${item.name}"?`, // Wiadomość
      'np. 15.50' // Placeholder w polu input
    );
  
    if (!amountStr) return; // Ktoś kliknął Anuluj lub zamknął okienko
  
    const amount = parseFloat(amountStr.replace(',', '.')); // Zamiana przecinka na kropkę
    
    if (isNaN(amount) || amount <= 0) {
      // Zamiast alert(), nasz czerwony dymek:
      this.toastService.show('Podano nieprawidłową kwotę! 🚨', 'error');
      return;
    }
  
    this.shoppingService.convertToBill(item.id, amount).subscribe({
      next: () => {
        // Zamiast alert(), nasz zielony dymek:
        this.toastService.show('Dodano do rachunków! 💸', 'success');
        this.loadItems(); // Produkt zniknie z listy zakupów
      },
      error: () => this.toastService.show('Nie udało się zamienić na wydatek. 🚨', 'error')
    });
  }
}