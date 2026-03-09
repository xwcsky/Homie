import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FlatsService {
  private apiUrl = environment.apiUrl + '/flats';

  constructor(private http: HttpClient) {}

  getMyFlat(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/my`);
  }

  // NOWE: Tworzenie mieszkania
  createFlat(name: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { name });
  }

  // NOWE: Dołączanie do mieszkania
  joinFlat(code: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/join`, { code });
  }

  updateBoard(data: { wifiPassword?: string; bankAccount?: string; boardNotes?: string }): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/board`, data);
  }

  generateNewCode(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/generate-code`, {});
  }

}