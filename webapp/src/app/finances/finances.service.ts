import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Bill, Summary } from '../features/finances/expense-list/bill-model';

@Injectable({
  providedIn: 'root'
})
export class FinancesService {
  private apiUrl = environment.apiUrl + '/bills'; // http://localhost:3000/bills

  constructor(private http: HttpClient) {}

  // 1. Pobierz listę rachunków
  getBills(): Observable<Bill[]> {
    return this.http.get<Bill[]>(this.apiUrl);
  }

  // 2. Dodaj nowy rachunek
  addBill(title: string, amount: number): Observable<Bill> {
    return this.http.post<Bill>(this.apiUrl, { title, amount });
  }

  // 3. Pobierz podsumowanie (kto komu wisi)
  getSummary(): Observable<Summary> {
    return this.http.get<Summary>(`${this.apiUrl}/summary`);
  }
}