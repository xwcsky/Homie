import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  private async getFlatId(userId: number) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId },
    });
    if (!membership) throw new BadRequestException('Brak mieszkania');
    return membership.flatId;
  }

  // Zmodyfikowana metoda create
  async create(userId: number, title: string, assignedToId?: number, date?: string, isWeekly?: boolean) {
    const flatId = await this.getFlatId(userId);
    const startDate = date ? new Date(date) : null;

    // Jeśli ktoś zaznaczył "Cały tydzień" i podał datę startową:
    if (isWeekly && startDate) {
      const tasksToCreate: any[] = [];
      
      // Pętla tworząca zadania na 7 kolejnych dni
      for (let i = 0; i < 7; i++) {
        const taskDate = new Date(startDate);
        taskDate.setDate(taskDate.getDate() + i); // Dodajemy 'i' dni
        
        tasksToCreate.push({
          title,
          flatId,
          assignedToId: assignedToId ? Number(assignedToId) : null,
          date: taskDate,
        });
      }
      
      // Tworzymy wszystkie 7 zadań naraz (wydajność!)
      await this.prisma.task.createMany({ data: tasksToCreate });
      return { message: 'Utworzono zadania na cały tydzień' };
      
    } else {
      // Standardowe dodawanie pojedynczego zadania
      return this.prisma.task.create({
        data: { 
          title, 
          flatId,
          assignedToId: assignedToId ? Number(assignedToId) : null,
          date: startDate 
        },
        include: { 
          assignedTo: { select: { name: true, email: true } } 
        }
      });
    }
  }

  // Pobierz wszystkie zadania z mojego mieszkania
  async findAllMyTasks(userId: number) {
    const flatId = await this.getFlatId(userId);
    return this.prisma.task.findMany({
      where: { flatId },
      include: { 
        assignedTo: { select: { name: true, email: true } } 
      },
      orderBy: [
        { date: 'asc' }, // Najpierw sortujemy po dacie rosnąco
        { createdAt: 'desc' }
      ]
    });
  }

  async update(id: number, userId: number, updateTaskDto: UpdateTaskDto) {
    // 1. Sprawdzamy czy zadanie istnieje
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new BadRequestException('Nie ma takiego zadania');

    // 2. Sprawdzamy czy użytkownik mieszka tam gdzie jest zadanie (Security!)
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_flatId: { // Unikalny klucz złożony
          userId: userId,
          flatId: task.flatId,
        },
      },
    });

    if (!membership) throw new BadRequestException('Nie masz dostępu do tego zadania!');

    // 3. Aktualizujemy
    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });
  }

  async remove(id: number, userId: number) {
    // 1. Pobieramy zadanie
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new BadRequestException('Nie ma takiego zadania');

    // 2. Security check (czy to moje mieszkanie?)
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_flatId: {
          userId: userId,
          flatId: task.flatId,
        },
      },
    });

    if (!membership) throw new BadRequestException('Nie masz dostępu do tego zadania!');

    // 3. Usuwamy
    return this.prisma.task.delete({ where: { id } });
  }
}