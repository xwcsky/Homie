import { forkJoin } from 'rxjs';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChoresService } from '../../../chores/chores.service';
import { FlatsService } from '../../../flats/flats.service';
import { Chore } from './chores.model';
import { ConfirmService } from 'src/app/confirm.service';
import { ToastService } from 'src/app/toast.service';

@Component({
  selector: 'app-chores-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chores-board.component.html',
  styleUrls: ['./chores-board.component.scss']
})
export class ChoresBoardComponent implements OnInit {
  showScheduleModal = false;
  schedTitle = '';
  schedDay = 1; 
  schedWeeks = 8; 
  schedType: 'SINGLE_DAY' | 'FULL_WEEK' = 'SINGLE_DAY'; // Nowy przełącznik
  schedMode: string | null = 'ROTATE';

  daysOfWeek = [
    { id: 1, name: 'Poniedziałki' },
    { id: 2, name: 'Wtorki' },
    { id: 3, name: 'Środy' },
    { id: 4, name: 'Czwartki' },
    { id: 5, name: 'Piątki' },
    { id: 6, name: 'Soboty' },
    { id: 0, name: 'Niedziele' }
  ];
  displayItems: any[] = []; 
  rawChores: Chore[] = []; 
  members: any[] = []; 
  confirmService = inject(ConfirmService);
  toastService = inject(ToastService);
  
  // Tablica przechowująca wyniki rankingu
  ranking: { name: string, points: number }[] = [];
  
  newChoreTitle = '';
  newChoreAssignee: number | null = null;
  newChoreDate: string = '';
  isWeekly: boolean = false;

  currentDate = new Date();
  calendarDays: any[] = [];
  monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];

  constructor(private choresService: ChoresService, private flatsService: FlatsService) {}

  ngOnInit() {
    this.loadChores();
    this.loadMembers();
    this.generateCalendar(); 
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
      this.mapTasksToCalendar();
      this.calculateRanking(data); // <-- Odpalamy liczenie rankingu!
    });
  }

  // 🔥 LOGIKA RANKINGU
  calculateRanking(data: Chore[]) {
    const scores = new Map<string, number>();

    // Przeszukujemy wszystkie zadania
    data.forEach(chore => {
      // Jeśli zadanie jest zrobione i ktoś był do niego przypisany
      if (chore.isDone && chore.assignedTo) {
        const name = chore.assignedTo.name;
        // Dodajemy 1 punkt do konta tej osoby
        scores.set(name, (scores.get(name) || 0) + 1);
      }
    });

    // Zamieniamy mapę na tablicę i sortujemy od największej liczby punktów
    this.ranking = Array.from(scores.entries())
      .map(([name, points]) => ({ name, points }))
      .sort((a, b) => b.points - a.points);
  }

  changeMonth(offset: number) {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + offset, 1);
    this.generateCalendar();
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    let firstDayIndex = new Date(year, month, 1).getDay();
    let startOffset = firstDayIndex - 1;
    if (startOffset === -1) startOffset = 6; 

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = new Date().toISOString().split('T')[0];

    this.calendarDays = [];

    for(let i = 0; i < startOffset; i++) {
      this.calendarDays.push({ empty: true });
    }

    for(let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(year, month, i, 12, 0, 0);
      const dateStr = dateObj.toISOString().split('T')[0];

      this.calendarDays.push({ empty: false, dayNumber: i, dateStr: dateStr, isToday: dateStr === todayStr, tasks: [], tooltip: '' });
    }
    this.mapTasksToCalendar();
  }

  mapTasksToCalendar() {
    if (!this.calendarDays.length || !this.rawChores.length) return;
    this.calendarDays.forEach(day => { if (!day.empty) { day.tasks = []; day.tooltip = ''; } });
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

  groupChores(data: Chore[]) {
    const groups: any[] = [];
    const processedIds = new Set<number>();

    for (const chore of data) {
      if (processedIds.has(chore.id)) continue;

      const similarChores = data.filter(c => c.title === chore.title && c.assignedToId === chore.assignedToId && !!c.date === !!chore.date);

      if (similarChores.length > 1 && chore.date) {
        similarChores.forEach(c => processedIds.add(c.id)); 
        similarChores.sort((a,b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
        const doneCount = similarChores.filter(c => c.isDone).length;

        groups.push({
          isGroup: true, title: chore.title, assignedTo: chore.assignedTo,
          isDone: doneCount === similarChores.length, doneCount: doneCount, totalCount: similarChores.length,
          startDate: similarChores[0].date, endDate: similarChores[similarChores.length - 1].date, originalChores: similarChores 
        });
      } else {
        processedIds.add(chore.id);
        groups.push({ isGroup: false, title: chore.title, assignedTo: chore.assignedTo, isDone: chore.isDone, date: chore.date, originalChores: [chore] });
      }
    }
    this.displayItems = groups;
  }

  add() {
    if (!this.newChoreTitle.trim()) return;
    this.choresService.addChore(this.newChoreTitle, this.newChoreAssignee ? this.newChoreAssignee : undefined, this.newChoreDate ? this.newChoreDate : undefined, this.isWeekly).subscribe(() => {
      this.newChoreTitle = ''; this.newChoreAssignee = null; this.newChoreDate = ''; this.isWeekly = false; this.loadChores(); 
    });
  }

  toggle(item: any) {
    const dzisiaj = new Date();
    dzisiaj.setHours(0, 0, 0, 0);

    if (!item.isGroup) {
      // 1. ZADANIE POJEDYNCZE (prawdziwe id siedzi w originalChores[0])
      const realChore = item.originalChores[0];
      const choreId = realChore.id || realChore._id || realChore.taskId; // Zabezpieczenie nazwy ID
      
      // Blokada przed oszukiwaniem (tylko przy próbie ZAZNACZENIA)
      if (!item.isDone && item.date) {
        const taskDate = new Date(item.date);
        taskDate.setHours(0, 0, 0, 0);
        
        if (taskDate > dzisiaj) {
          this.toastService.show('Nie oszukuj! To zadanie jest na przyszłość. 🛑', 'error');
          return;
        }
      }

      const newState = !item.isDone;
      item.isDone = newState; // Zmieniamy w widoku
      
      this.choresService.toggleChore(choreId, newState).subscribe({
        next: () => this.loadChores(),
        error: () => {
          item.isDone = !newState; // W razie błędu serwera cofamy
          this.toastService.show('Błąd zapisu. 🚨', 'error');
        }
      });

    } else {
      // 2. GRUPA (CAŁY TYDZIEŃ)
      if (!item.isDone) {
        // Chcemy ODFAJKOWAĆ CZĘŚĆ - szukamy pierwszego NIEZROBIONEGO
        const choreToComplete = item.originalChores.find((c: any) => !c.isDone);
        
        if (choreToComplete) {
          const taskDate = new Date(choreToComplete.date);
          taskDate.setHours(0, 0, 0, 0);

          if (taskDate > dzisiaj) {
            this.toastService.show('Dzisiejsza część zrobiona! Reszta czeka na swoje dni. 🛑', 'info');
            return;
          }

          const choreId = choreToComplete.id || choreToComplete._id;
          
          this.choresService.toggleChore(choreId, true).subscribe({
            next: () => {
              this.toastService.show('Kawał dobrej roboty! +1 pkt 🏆', 'success');
              this.loadChores(); 
            },
            error: () => this.toastService.show('Błąd zapisu. 🚨', 'error')
          });
        }
      } else {
        // Chcemy COFNĄĆ ODFAJKOWANIE (przypadkowe kliknięcie)
        const choreToUndo = [...item.originalChores].reverse().find((c: any) => c.isDone);
        
        if (choreToUndo) {
          const choreId = choreToUndo.id || choreToUndo._id;

          this.choresService.toggleChore(choreId, false).subscribe({
            next: () => this.loadChores(), // Po cichu cofamy błąd użytkownika
            error: () => this.toastService.show('Błąd zapisu. 🚨', 'error')
          });
        }
      }
    }
  }

  get activeItems() {
    const dzisiaj = new Date();
    dzisiaj.setHours(0, 0, 0, 0);

    return this.displayItems.filter(item => {
      let taskDate = new Date();
      if (item.isGroup) {
        const nextChore = item.originalChores.find((c: any) => !c.isDone);
        if (!nextChore) return true; // Jak zrobione w 100%, zostawiamy w aktywnych, żeby móc cofnąć
        taskDate = new Date(nextChore.date);
      } else if (item.date) {
        taskDate = new Date(item.date);
      }
      taskDate.setHours(0, 0, 0, 0);
      return taskDate <= dzisiaj; // Zwraca wszystko z dzisiaj i przeszłości
    });
  }

  // Automatycznie filtrują zadania z Przyszłości
  get futureItems() {
    const dzisiaj = new Date();
    dzisiaj.setHours(0, 0, 0, 0);

    return this.displayItems.filter(item => {
      let taskDate = new Date();
      if (item.isGroup) {
        const nextChore = item.originalChores.find((c: any) => !c.isDone);
        if (!nextChore) return false;
        taskDate = new Date(nextChore.date);
      } else if (item.date) {
        taskDate = new Date(item.date);
      }
      taskDate.setHours(0, 0, 0, 0);
      return taskDate > dzisiaj; // Tylko zadania jutrzejsze i dalsze
    });
  }

  // Funkcja sprawdzająca czy zadanie jest zaległe
  isOverdue(dateString: string | Date | null): boolean {
    if (!dateString) return false;
    
    const taskDate = new Date(dateString);
    taskDate.setHours(0, 0, 0, 0);
    
    const dzisiaj = new Date();
    dzisiaj.setHours(0, 0, 0, 0);
    
    return taskDate < dzisiaj;
  }

  async remove(item: any) {
    const isConfirmed = await this.confirmService.ask(
      'Usuwanie obowiązku',
      `Czy na pewno chcesz usunąć zadanie "${item.title}"?`,
      'Tak, usuń 🗑️',
      'Anuluj'
    );

    if (!isConfirmed) return;

    const deleteRequests = item.originalChores.map((c: any) => 
      this.choresService.deleteChore(c.id)
    );

    if (deleteRequests.length > 0) {
      forkJoin(deleteRequests).subscribe({
        next: () => {
          this.toastService.show('Obowiązek usunięty! 🧹', 'success');
          this.loadChores();
        },
        error: () => {
          this.toastService.show('Błąd podczas usuwania. Spróbuj ponownie. 🚨', 'error');
        }
      });
    }
  }

// Kuloodporne przypisywanie kolorów
getUserTheme(assignedTo: any) {
  // 1. Domyślny, szary kolor (gdy zadanie jest dla "Ktokolwiek")
  if (!assignedTo) return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' };
  
  // 2. Nasza paleta barw
  const colors = [
    { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', dot: 'bg-purple-500' },
    { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200', dot: 'bg-pink-500' },
    { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200', dot: 'bg-sky-500' },
    { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200', dot: 'bg-teal-500' },
    { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', dot: 'bg-orange-500' }
  ];

  // 3. Szukamy, którym z kolei domownikiem jest ta osoba
  let index = this.members.findIndex((m: any) => 
    m.user?.name === assignedTo.name || 
    m.userId === assignedTo.id ||
    m.user?.id === assignedTo.id
  );

  // 4. Jeśli cudem nie znalazło, dajemy losowy kolor na podstawie długości imienia
  if (index === -1) {
    index = assignedTo.name ? assignedTo.name.length : 0;
  }

  // 5. Zwracamy kolor dla danej osoby!
  return colors[index % colors.length];
}

openScheduleModal() {
  this.schedTitle = this.newChoreTitle || ''; // Kopiuje wpisany tytuł, jeśli jakiś jest
  this.showScheduleModal = true;
}

closeScheduleModal() {
  this.showScheduleModal = false;
}

isGenerating = false; // Dodaj tę zmienną na górze klasy

  generateSchedule() {
    if (!this.schedTitle.trim() || this.isGenerating) return;

    this.isGenerating = true; // Blokujemy przycisk

    // 1. Znajdujemy datę najbliższego wybranego dnia (np. Poniedziałku)
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    while (startDate.getDay() !== this.schedDay) {
      startDate.setDate(startDate.getDate() + 1);
    }

    const requests = [];
    let memberIndex = 0;

    // 2. Pętla TYGODNI - wysyłamy tylko JEDNO zapytanie na tydzień
    for (let w = 0; w < this.schedWeeks; w++) {
      
      let weekAssignee = null;
      if (this.schedMode === 'ROTATE' && this.members.length > 0) {
        weekAssignee = this.members[memberIndex % this.members.length].userId;
        memberIndex++;
      } else {
        weekAssignee = this.schedMode !== 'ROTATE' ? this.schedMode : null;
      }

      const taskDate = new Date(startDate);
      taskDate.setDate(taskDate.getDate() + (w * 7));
      
      const localDate = new Date(taskDate.getTime() - (taskDate.getTimezoneOffset() * 60000));
      const dateString = localDate.toISOString().split('T')[0];

      // WYSYŁAMY TYLKO RAZ NA TYDZIEŃ
      requests.push(
        this.choresService.addChore(
          this.schedTitle, 
          weekAssignee ? weekAssignee : undefined, 
          dateString, 
          this.schedType === 'FULL_WEEK' // Tu decydujemy czy backend ma rozbić to na 7 dni
        )
      );
    }

    // 3. Odpalamy paczkę
    forkJoin(requests).subscribe({
      next: () => {
        this.toastService.show(`Harmonogram gotowy! 🪄`, 'success');
        this.closeScheduleModal();
        this.loadChores();
        this.newChoreTitle = '';
        this.isGenerating = false;
      },
      error: () => {
        this.toastService.show('Błąd zapisu. 🚨', 'error');
        this.isGenerating = false;
      }
    });
  }
}