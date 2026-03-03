import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Chore } from '../features/chores/chores-board/chores.model';

@Injectable({
  providedIn: 'root'
})
export class ChoresService {
  private apiUrl = environment.apiUrl + '/tasks'; // Backend endpoint to /tasks

  constructor(private http: HttpClient) {}

  // 1. Pobierz wszystkie zadania
  getChores(): Observable<Chore[]> {
    return this.http.get<Chore[]>(this.apiUrl);
  }

  // 2. Dodaj nowe zadanie
  addChore(title: string): Observable<Chore> {
    return this.http.post<Chore>(this.apiUrl, { title });
  }

  // 3. Zmień status (Zrobione/Niezrobione)
  toggleChore(id: number, isDone: boolean): Observable<Chore> {
    return this.http.patch<Chore>(`${this.apiUrl}/${id}`, { isDone });
  }

  // 4. Usuń zadanie
  deleteChore(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}