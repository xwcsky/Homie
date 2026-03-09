import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChoresService } from '../../../chores/chores.service';
import { FlatsService } from '../../../flats/flats.service';
import { Chore } from './chores.model';

@Component({
  selector: 'app-chores-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="layout">
      <div class="main-content">
        <h2>Grafik Sprzątania 🧹</h2>

        <div class="add-box">
          <input type="text" [(ngModel)]="newChoreTitle" placeholder="Co trzeba zrobić?" class="input-main">
          <select [(ngModel)]="newChoreAssignee">
            <option [ngValue]="null">Ktokolwiek</option>
            <option *ngFor="let member of members" [ngValue]="member.userId">{{ member.user.name }}</option>
          </select>
          <input type="date" [(ngModel)]="newChoreDate">
          <label *ngIf="newChoreDate" class="weekly-checkbox">
            <input type="checkbox" [(ngModel)]="isWeekly"> 🔄 Cały tydzień
          </label>
          <button (click)="add()" class="btn-add">Zaplanuj</button>
        </div>

        <ul class="chore-list">
          <li *ngFor="let item of displayItems" [class.done]="item.isDone">
            <input type="checkbox" [checked]="item.isDone" (change)="toggle(item)">
            <div class="chore-info">
              <span class="title">
                {{ item.title }} 
                <span *ngIf="item.isGroup" class="progress-counter">({{ item.doneCount }}/{{ item.totalCount }})</span>
              </span>
              <div class="meta">
                <span *ngIf="item.isGroup" class="badge date-badge">📅 {{ item.startDate | date:'dd.MM' }} - {{ item.endDate | date:'dd.MM' }}</span>
                <span *ngIf="!item.isGroup && item.date" class="badge date-badge">📅 {{ item.date | date:'dd.MM.yyyy' }}</span>
                <span *ngIf="item.assignedTo" class="badge user-badge">👤 {{ item.assignedTo.name }}</span>
              </div>
            </div>
            <button class="delete-btn" (click)="remove(item)">🗑️</button>
          </li>
        </ul>
        <p *ngIf="displayItems.length === 0">Grafik czysty! Można odpoczywać. 🎉</p>
      </div>

      <div class="calendar-sidebar">
        <div class="calendar-card">
          <div class="calendar-header">
            <button (click)="changeMonth(-1)">◀</button>
            <h3>{{ monthNames[currentDate.getMonth()] }} {{ currentDate.getFullYear() }}</h3>
            <button (click)="changeMonth(1)">▶</button>
          </div>
          
          <div class="calendar-grid">
            <div class="day-name">Pn</div><div class="day-name">Wt</div><div class="day-name">Śr</div>
            <div class="day-name">Cz</div><div class="day-name">Pt</div><div class="day-name">Sb</div><div class="day-name">Nd</div>

            <div 
              *ngFor="let day of calendarDays" 
              class="calendar-day" 
              [class.empty]="day.empty" 
              [class.today]="day.isToday"
              [title]="day.tooltip"
            >
              <span *ngIf="!day.empty">{{ day.dayNumber }}</span>
              
              <div class="dots" *ngIf="!day.empty && day.tasks.length > 0">
                <div *ngFor="let t of day.tasks" class="dot" [class.dot-done]="t.isDone"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .layout { display: flex; gap: 30px; flex-wrap: wrap; padding: 20px; max-width: 1000px; font-family: sans-serif; align-items: flex-start;}
    .main-content { flex: 2; min-width: 350px; }
    .calendar-sidebar { flex: 1; min-width: 300px; }
    
    /* Style formularza i listy (bez zmian) */
    .add-box { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #ddd; align-items: center;}
    .input-main { flex: 1; min-width: 150px; padding: 8px; border-radius: 4px; border: 1px solid #ccc; }
    select, input[type="date"] { padding: 8px; border-radius: 4px; border: 1px solid #ccc; }
    .weekly-checkbox { font-size: 0.9rem; cursor: pointer; }
    .btn-add { background: #007bff; color: white; border: none; padding: 8px 15px; cursor: pointer; border-radius: 4px; font-weight: bold; }
    .chore-list { list-style: none; padding: 0; margin: 0; }
    .chore-list li { display: flex; align-items: center; gap: 15px; padding: 12px; border-bottom: 1px solid #eee; }
    .chore-list li.done .title { text-decoration: line-through; color: #888; }
    .chore-info { display: flex; flex-direction: column; flex: 1; gap: 4px; }
    .progress-counter { font-size: 0.8rem; color: #007bff; font-weight: bold; margin-left: 5px;}
    .meta { display: flex; gap: 8px; font-size: 0.8rem; }
    .badge { padding: 2px 6px; border-radius: 4px; }
    .date-badge { background: #fff3cd; color: #856404; font-weight: bold;}
    .user-badge { background: #e2e3e5; color: #383d41; }
    .delete-btn { background: none; border: none; cursor: pointer; font-size: 1.2rem; }

    /* NOWE: Style Kalendarza */
    .calendar-card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .calendar-header button { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #007bff; }
    .calendar-header h3 { margin: 0; font-size: 1.1rem; }
    .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; text-align: center; }
    .day-name { font-weight: bold; font-size: 0.8rem; color: #666; margin-bottom: 5px; }
    .calendar-day { background: #f8f9fa; border-radius: 4px; padding: 8px 4px; min-height: 45px; display: flex; flex-direction: column; align-items: center; font-size: 0.9rem; }
    .calendar-day.empty { background: transparent; border: none; }
    .calendar-day.today { background: #e0f0ff; border: 1px solid #007bff; font-weight: bold; color: #007bff; }
    .dots { display: flex; flex-wrap: wrap; gap: 3px; justify-content: center; margin-top: 5px; max-width: 30px; }
    .dot { width: 6px; height: 6px; background-color: #dc3545; border-radius: 50%; }
    .dot.dot-done { background-color: #28a745; opacity: 0.5; }
  `]
})
export class ChoresBoardComponent implements OnInit {
  displayItems: any[] = []; 
  rawChores: Chore[] = []; // Trzymamy wszystkie zadania do kalendarza
  members: any[] = []; 
  
  newChoreTitle = '';
  newChoreAssignee: number | null = null;
  newChoreDate: string = '';
  isWeekly: boolean = false;

  // --- Zmienne Kalendarza ---
  currentDate = new Date();
  calendarDays: any[] = [];
  monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];

  constructor(private choresService: ChoresService, private flatsService: FlatsService) {}

  ngOnInit() {
    this.loadChores();
    this.loadMembers();
    this.generateCalendar(); // Inicjalizacja kalendarza
  }

  loadMembers() {
    this.flatsService.getMyFlat().subscribe(flat => {
      if (flat && flat.memberships) this.members = flat.memberships;
    });
  }

  loadChores() {
    this.choresService.getChores().subscribe(data => {
      this.rawChores = data;
      this.groupChores(data); 
      this.mapTasksToCalendar(); // Po załadowaniu zadań nanies my je na kalendarz
    });
  }

  // --- LOGIKA KALENDARZA ---
  changeMonth(offset: number) {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + offset, 1);
    this.generateCalendar();
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    // 0 to Niedziela, my chcemy żeby tydzień zaczynał się w Poniedziałek
    let firstDayIndex = new Date(year, month, 1).getDay();
    let startOffset = firstDayIndex - 1;
    if (startOffset === -1) startOffset = 6; 

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = new Date().toISOString().split('T')[0];

    this.calendarDays = [];

    // Puste kafelki na początku miesiąca
    for(let i = 0; i < startOffset; i++) {
      this.calendarDays.push({ empty: true });
    }

    // Właściwe dni
    for(let i = 1; i <= daysInMonth; i++) {
      // Tworzymy datę na godzinę 12:00, żeby uniknąć błędów stref czasowych
      const dateObj = new Date(year, month, i, 12, 0, 0);
      const dateStr = dateObj.toISOString().split('T')[0];

      this.calendarDays.push({
        empty: false,
        dayNumber: i,
        dateStr: dateStr,
        isToday: dateStr === todayStr,
        tasks: [],
        tooltip: ''
      });
    }

    this.mapTasksToCalendar();
  }

  mapTasksToCalendar() {
    if (!this.calendarDays.length || !this.rawChores.length) return;

    // Resetujemy zadania w dniach
    this.calendarDays.forEach(day => { if (!day.empty) { day.tasks = []; day.tooltip = ''; } });

    // Wrzucamy zadania w odpowiednie okienka
    this.rawChores.forEach(chore => {
      if (!chore.date) return;
      const choreDateStr = new Date(chore.date).toISOString().split('T')[0];

      const targetDay = this.calendarDays.find(d => !d.empty && d.dateStr === choreDateStr);
      if (targetDay) {
        targetDay.tasks.push(chore);
        targetDay.tooltip += `${chore.title} (${chore.isDone ? 'Zrobione' : 'Do zrobienia'})\n`;
      }
    });
  }
  // -------------------------

  groupChores(data: Chore[]) {
    const groups: any[] = [];
    const processedIds = new Set<number>();

    for (const chore of data) {
      if (processedIds.has(chore.id)) continue;

      const similarChores = data.filter(c => 
        c.title === chore.title && 
        c.assignedToId === chore.assignedToId &&
        !!c.date === !!chore.date 
      );

      if (similarChores.length > 1 && chore.date) {
        similarChores.forEach(c => processedIds.add(c.id)); 
        similarChores.sort((a,b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
        const doneCount = similarChores.filter(c => c.isDone).length;

        groups.push({
          isGroup: true,
          title: chore.title,
          assignedTo: chore.assignedTo,
          isDone: doneCount === similarChores.length, 
          doneCount: doneCount,
          totalCount: similarChores.length,
          startDate: similarChores[0].date,
          endDate: similarChores[similarChores.length - 1].date,
          originalChores: similarChores 
        });
      } else {
        processedIds.add(chore.id);
        groups.push({
          isGroup: false,
          title: chore.title,
          assignedTo: chore.assignedTo,
          isDone: chore.isDone,
          date: chore.date,
          originalChores: [chore]
        });
      }
    }
    this.displayItems = groups;
  }

  add() {
    if (!this.newChoreTitle.trim()) return;

    this.choresService.addChore(
      this.newChoreTitle, 
      this.newChoreAssignee ? this.newChoreAssignee : undefined, 
      this.newChoreDate ? this.newChoreDate : undefined,
      this.isWeekly 
    ).subscribe(() => {
      this.newChoreTitle = '';
      this.newChoreAssignee = null;
      this.newChoreDate = '';
      this.isWeekly = false; 
      this.loadChores(); 
    });
  }

  toggle(item: any) {
    const newState = !item.isDone;
    item.isDone = newState;
    let completed = 0;
    item.originalChores.forEach((c: any) => {
      this.choresService.toggleChore(c.id, newState).subscribe(() => {
        completed++;
        if (completed === item.originalChores.length) this.loadChores();
      });
    });
  }

  remove(item: any) {
    if(!confirm('Na pewno usunąć?')) return;
    let completed = 0;
    item.originalChores.forEach((c: any) => {
      this.choresService.deleteChore(c.id).subscribe(() => {
        completed++;
        if (completed === item.originalChores.length) this.loadChores();
      });
    });
  }
}