export class CreateTaskDto {
    title: string;       // Np. "Wynieś śmieci"
    assignedToId?: number; // ID Marka (opcjonalne - może być null)
  }