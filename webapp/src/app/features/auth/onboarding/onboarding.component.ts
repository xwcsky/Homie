import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FlatsService } from 'src/app/flats/flats.service'; 
import { AuthService } from 'src/app/auth/auth.service';
import { ToastService } from 'src/app/toast.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent {
  flatsService = inject(FlatsService);
  router = inject(Router);
  authService = inject(AuthService);
  toastService = inject(ToastService);
  newFlatName = '';
  joinCode = '';
  errorMessage = '';

  createFlat() {
    this.errorMessage = '';
    if (!this.newFlatName.trim()) {
      this.errorMessage = 'Wpisz nazwę dla swojego nowego mieszkania!';
      return;
    }

    this.flatsService.createFlat(this.newFlatName).subscribe({
      next: () => {
        this.toastService.show('Mieszkanie utworzone! Jesteś Administratorem. 👑', 'success');
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.toastService.show('Nie udało się stworzyć mieszkania.', 'error');
      }
    });
  }

  joinFlat() {
    this.errorMessage = '';
    if (!this.joinCode.trim()) {
      this.errorMessage = 'Podaj kod zaproszenia od znajomych!';
      return;
    }

    this.flatsService.joinFlat(this.joinCode).subscribe({
      next: () => {
        this.toastService.show('Udało się! Dołączyłeś do ekipy. 🎉', 'success');
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.toastService.show('Nieprawidłowy kod zaproszenia. Spróbuj ponownie. 🚨', 'error');
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}