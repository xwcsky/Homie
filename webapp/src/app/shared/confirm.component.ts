import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from '../confirm.service';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="(confirmService.state$ | async)?.show" class="fixed inset-0 z-[200] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
      
      <div class="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border-2 border-gray-200 transform transition-all">
        
        <div class="flex items-center gap-4 mb-4">
          <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-2xl border-2 border-red-200 shrink-0">⚠️</div>
          <h3 class="text-2xl font-black text-gray-800">{{ (confirmService.state$ | async)?.title }}</h3>
        </div>
        
        <p class="text-gray-600 font-bold mb-8 text-lg leading-relaxed">
          {{ (confirmService.state$ | async)?.message }}
        </p>
        
        <div class="flex flex-col-reverse sm:flex-row gap-3">
          <button (click)="confirmService.answer(false)" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black py-3 px-4 rounded-2xl transition-colors border-2 border-gray-300">
            {{ (confirmService.state$ | async)?.cancelText }}
          </button>
          <button (click)="confirmService.answer(true)" class="flex-1 bg-red-500 hover:bg-red-400 text-white font-black py-3 px-4 rounded-2xl border-b-4 border-red-700 active:border-b-0 active:mt-1 transition-all">
            {{ (confirmService.state$ | async)?.confirmText }}
          </button>
        </div>
      </div>
      
    </div>
  `
})
export class ConfirmComponent {
  confirmService = inject(ConfirmService);
}