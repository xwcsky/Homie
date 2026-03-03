import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  isDone?: boolean; // Dodajemy to pole, żeby móc odznaczać zadania
}