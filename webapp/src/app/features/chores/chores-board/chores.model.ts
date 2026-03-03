export interface Chore {
    id: number;
    title: string;
    isDone: boolean;
    assignedToId?: number; // Opcjonalne
    assignedTo?: {
      name: string;
      email: string;
    };
  }