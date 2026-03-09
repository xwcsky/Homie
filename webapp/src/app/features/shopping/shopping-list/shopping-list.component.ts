import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShoppingService, ShoppingItem } from '../shopping.service';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h1>Wspólne Zakupy 🛒</h1>

      <div class="add-box">
        <input 
          type="text" 
          [(ngModel)]="newItemName" 
          placeholder="Co trzeba kupić? (np. Mleko)"
          (keyup.enter)="add()"
        >
        <button (click)="add()">Dodaj</button>
      </div>

      <ul class="shopping-list">
        <li *ngFor="let item of items" [class.bought]="item.isBought">
          
          <div class="item-main">
            <input 
              type="checkbox" 
              [checked]="item.isBought" 
              (change)="toggle(item)"
            >
            <span class="name">{{ item.name }}</span>
            <span *ngIf="item.buyer" class="buyer">Kupił/a: {{ item.buyer.name }}</span>
          </div>

          <div class="actions">
            <button 
              *ngIf="item.isBought" 
              class="btn-convert" 
              (click)="convertToBill(item)">
              💸 Zmień w wydatek
            </button>

            <button class="btn-delete" (click)="remove(item.id)">🗑️</button>
          </div>

        </li>
      </ul>
      
      <p *ngIf="items.length === 0">Lodówka pełna! Nie ma nic do kupienia. 🍏</p>
    </div>
  `,
  styles: [`
    .container { padding: 20px; max-width: 600px; font-family: sans-serif; }
    .add-box { display: flex; gap: 10px; margin-bottom: 20px; }
    .add-box input { flex: 1; padding: 10px; font-size: 1rem; border: 1px solid #ccc; border-radius: 4px; }
    .add-box button { padding: 10px 15px; cursor: pointer; }
    .shopping-list { list-style: none; padding: 0; }
    .shopping-list li { display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #eee; }
    .shopping-list li.bought .name { text-decoration: line-through; color: #888; }
    .item-main { display: flex; align-items: center; gap: 10px; }
    .buyer { font-size: 0.8rem; background: #e0f7fa; padding: 2px 6px; border-radius: 4px; }
    .actions { display: flex; gap: 10px; }
    .btn-convert { background: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-weight: bold;}
    .btn-delete { background: none; border: none; cursor: pointer; font-size: 1.2rem;}
  `]
})
export class ShoppingListComponent implements OnInit {
  items: ShoppingItem[] = [];
  newItemName = '';

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
  convertToBill(item: ShoppingItem) {
    const amountStr = prompt(`Ile kosztowało: "${item.name}"? (podaj kwotę np. 15.50)`);
    if (!amountStr) return; // Ktoś kliknął Anuluj

    const amount = parseFloat(amountStr.replace(',', '.')); // Zamiana przecinka na kropkę
    if (isNaN(amount) || amount <= 0) {
      alert('Podano nieprawidłową kwotę!');
      return;
    }

    this.shoppingService.convertToBill(item.id, amount).subscribe({
      next: () => {
        alert('Dodano do rachunków! 💸');
        this.loadItems(); // Produkt zniknie z listy zakupów
      },
      error: () => alert('Nie udało się zamienić na wydatek.')
    });
  }
}