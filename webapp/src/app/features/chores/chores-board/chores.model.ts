export interface Chore {
    id: number;
    title: string;
    isDone: boolean;
    date?: string;
    assignedToId?: number; // Opcjonalne
    assignedTo?: {
      name: string;
      email: string;
    };
  }