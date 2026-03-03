import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient); // Nowy sposób wstrzykiwania (Angular 16+)
  private apiUrl = environment.apiUrl + '/auth'; // http://localhost:3000/auth

  constructor() {}

  // Logowanie
  login(credentials: any) {
    return this.http.post<{ access_token: string }>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // Jak sukces, to zapisz token w "sejfie" przeglądarki
        localStorage.setItem('token', response.access_token);
      })
    );
  }

  // Rejestracja
  register(data: any) {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  // Wylogowanie
  logout() {
    localStorage.removeItem('token');
  }

  // Sprawdzenie czy jestem zalogowany (proste sprawdzenie czy token istnieje)
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
  
  // Pobranie tokena (przydada się później do interceptora)
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}