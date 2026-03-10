import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastComponent } from './shared/toast.component';
import { PromptComponent } from './shared/prompt.component';
import { ConfirmComponent } from './shared/confirm.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'] 
})
export class AppComponent {
  constructor(public router: Router) {}

  // Ta funkcja sprawdza, czy jesteśmy na stronie logowania lub rejestracji
  get isAuthPage(): boolean {
    return this.router.url === '/login' ||
     this.router.url === '/register' || 
    this.router.url === '/onboarding';;
  }
}