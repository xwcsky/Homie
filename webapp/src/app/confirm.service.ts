import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ConfirmData {
  show: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  private state = new BehaviorSubject<ConfirmData>({ show: false, title: '', message: '', confirmText: '', cancelText: '' });
  state$ = this.state.asObservable();
  
  // Zmienna przechowująca funkcję do rozwiązania "Obietnicy"
  private resolveFn: ((value: boolean) => void) | null = null;

  // Funkcja wywoływana przez komponenty (np. finanse, obowiązki)
  ask(title: string, message: string, confirmText = 'Tak, zrób to', cancelText = 'Anuluj'): Promise<boolean> {
    this.state.next({ show: true, title, message, confirmText, cancelText });
    
    return new Promise((resolve) => {
      this.resolveFn = resolve;
    });
  }

  // Funkcja wywoływana przez kliknięcie w przycisk na Modalu
  answer(result: boolean) {
    this.state.next({ show: false, title: '', message: '', confirmText: '', cancelText: '' });
    if (this.resolveFn) {
      this.resolveFn(result);
      this.resolveFn = null;
    }
  }
}