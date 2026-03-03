import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FlatsService {
  private apiUrl = environment.apiUrl + '/flats'; 

  // Wstrzykujemy HttpClient przez konstruktor (klasycznie)
  constructor(private http: HttpClient) {}

  getMyFlat(): Observable<any> {
    // Tu nie dodajemy nagłówków - Interceptor zrobi to za nas!
    return this.http.get<any>(`${this.apiUrl}/my`);
  }
}