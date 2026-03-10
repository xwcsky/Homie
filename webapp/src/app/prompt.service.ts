import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PromptData {
  show: boolean;
  title: string;
  message: string;
  placeholder: string;
}

@Injectable({
  providedIn: 'root'
})
export class PromptService {
  private state = new BehaviorSubject<PromptData>({ show: false, title: '', message: '', placeholder: '' });
  state$ = this.state.asObservable();
  
  // Zmienna przechowująca funkcję do rozwiązania Obietnicy (zwraca wpisany tekst lub null)
  private resolveFn: ((value: string | null) => void) | null = null;

  ask(title: string, message: string, placeholder = 'Wpisz wartość...'): Promise<string | null> {
    this.state.next({ show: true, title, message, placeholder });
    
    return new Promise((resolve) => {
      this.resolveFn = resolve;
    });
  }

  answer(result: string | null) {
    this.state.next({ show: false, title: '', message: '', placeholder: '' });
    if (this.resolveFn) {
      this.resolveFn(result);
      this.resolveFn = null;
    }
  }
}