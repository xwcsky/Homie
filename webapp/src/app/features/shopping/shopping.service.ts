import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'; // Zaktualizowana ścieżka!
import { Observable } from 'rxjs';

// Model danych
export interface ShoppingItem {
  id: number;
  name: string;
  isBought: boolean;
  buyer?: { name: string };
}

@Injectable({
  providedIn: 'root'
})
export class ShoppingService {
  private apiUrl = environment.apiUrl + '/shopping';

  constructor(private http: HttpClient) {}

  getItems(): Observable<ShoppingItem[]> {
    return this.http.get<ShoppingItem[]>(this.apiUrl);
  }

  addItem(name: string): Observable<ShoppingItem> {
    return this.http.post<ShoppingItem>(this.apiUrl, { name });
  }

  toggleItem(id: number, isBought: boolean): Observable<ShoppingItem> {
    return this.http.patch<ShoppingItem>(`${this.apiUrl}/${id}`, { isBought });
  }

  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Konwersja na wydatek
  convertToBill(id: number, amount: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/convert`, { amount });
  }
}