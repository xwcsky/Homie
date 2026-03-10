import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../toast.service'; // upewnij się, że ścieżka się zgadza!

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 left-0 w-full z-[100] flex justify-center pointer-events-none px-4">
      
      <div *ngIf="toastService.toast$ | async as toast" 
           class="pointer-events-auto transform transition-all duration-300 ease-out flex items-center gap-3 px-6 py-4 rounded-3xl border-b-4 border-2 shadow-xl font-black text-lg max-w-md w-full sm:w-auto"
           [ngClass]="{
             'bg-green-100 border-green-500 border-b-green-600 text-green-900': toast.type === 'success',
             'bg-red-100 border-red-500 border-b-red-600 text-red-900': toast.type === 'error',
             'bg-blue-100 border-blue-500 border-b-blue-600 text-blue-900': toast.type === 'info'
           }">
        
        <span *ngIf="toast.type === 'success'" class="text-2xl">✅</span>
        <span *ngIf="toast.type === 'error'" class="text-2xl">🚨</span>
        <span *ngIf="toast.type === 'info'" class="text-2xl">💡</span>
        
        <span class="flex-1 text-center sm:text-left">{{ toast.text }}</span>
      </div>
      
    </div>
  `
})
export class ToastComponent {
  toastService = inject(ToastService);
}