import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  text: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  // Trzyma aktualną wiadomość (lub null, gdy jest pusto)
  private toastSubject = new BehaviorSubject<ToastMessage | null>(null);
  toast$ = this.toastSubject.asObservable();

  show(text: string, type: 'success' | 'error' | 'info' = 'info') {
    this.toastSubject.next({ text, type });
    
    // Dymek znika automatycznie po 3 sekundach
    setTimeout(() => {
      this.toastSubject.next(null);
    }, 3000);
  }
}