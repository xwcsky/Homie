import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createTaskDto: CreateTaskDto) {
    // 1. Najpierw musimy wiedzieć, w jakim mieszkaniu jest ten użytkownik
    const membership = await this.prisma.membership.findFirst({
      where: { userId: userId },
    });

    if (!membership) {
      throw new BadRequestException('Musisz należeć do mieszkania, żeby dodawać zadania!');
    }

    // 2. Tworzymy zadanie w tym mieszkaniu
    return this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        flatId: membership.flatId, // <--- Przypisujemy do mieszkania Janka
        assignedToId: createTaskDto.assignedToId, // <--- Przypisujemy do Marka (jeśli podano)
      },
    });
  }

  // Pobierz wszystkie zadania z mojego mieszkania
  async findAllMyTasks(userId: number) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId: userId },
    });

    if (!membership) return [];

    return this.prisma.task.findMany({
      where: { flatId: membership.flatId },
      include: {
        assignedTo: { // Chcemy widzieć imię osoby przypisanej
          select: { name: true, email: true }
        }
      }
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