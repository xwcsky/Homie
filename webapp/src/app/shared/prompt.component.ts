import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Potrzebne do [(ngModel)]
import { PromptService } from '../prompt.service';

@Component({
  selector: 'app-prompt',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="(promptService.state$ | async)?.show" class="fixed inset-0 z-[200] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
      
      <div class="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border-2 border-gray-200 transform transition-all">
        
        <div class="flex items-center gap-4 mb-4">
          <div class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-2xl border-2 border-emerald-200 shrink-0">💸</div>
          <h3 class="text-2xl font-black text-gray-800">{{ (promptService.state$ | async)?.title }}</h3>
        </div>
        
        <p class="text-gray-600 font-bold mb-6 text-lg leading-relaxed">
          {{ (promptService.state$ | async)?.message }}
        </p>
        
        <input type="text" [(ngModel)]="inputValue" [placeholder]="(promptService.state$ | async)?.placeholder" (keyup.enter)="submit()"
               class="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl px-5 py-4 font-black text-xl text-gray-800 outline-none focus:border-emerald-500 transition-colors mb-8 text-center" autofocus>
        
        <div class="flex flex-col-reverse sm:flex-row gap-3">
          <button (click)="cancel()" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black py-3 px-4 rounded-2xl transition-colors border-2 border-gray-300">
            Anuluj
          </button>
          <button (click)="submit()" class="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-black py-3 px-4 rounded-2xl border-b-4 border-emerald-700 active:border-b-0 active:mt-1 transition-all">
            Zapisz
          </button>
        </div>
      </div>
      
    </div>
  `
})
export class PromptComponent {
  promptService = inject(PromptService);
  inputValue = '';

  submit() {
    this.promptService.answer(this.inputValue);
    this.inputValue = ''; // Czyścimy pole na następny raz
  }

  cancel() {
    this.promptService.answer(null);
    this.inputValue = ''; // Czyścimy pole
  }
}