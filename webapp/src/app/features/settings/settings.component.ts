import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FlatsService } from '../../flats/flats.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  flatData: any = null;

  constructor(
    private flatsService: FlatsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.flatsService.getMyFlat().subscribe({
      next: (data) => this.flatData = data
    });
  }

  generateNewCode() {
    if(confirm('⚠️ UWAGA! Wygenerowanie nowego kodu sprawi, że nikt nie dołączy już przy użyciu starego. Jesteś pewien?')) {
      this.flatsService.generateNewCode().subscribe({
        next: (response) => {
          alert('Wygenerowano nowy kod!');
          this.flatData.code = response.code; 
        },
        error: () => alert('Błąd podczas generowania kodu.')
      });
    }
  }

  logout() {
    this.authService.logout(); 
    this.router.navigate(['/login']); 
  }
}