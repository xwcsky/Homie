export interface Bill {
    id: number;
    title: string;
    amount: number;
    createdAt: string;
    payer: {
      name: string;
      email: string;
    };
  }
  
  export interface Balance {
    name: string;
    paid: number;
    balance: number; // np. -20.50 (wisi) lub +15.00 (mu wiszą)
    status: 'OWED' | 'OWES';
  }
  
  export interface Summary {
    totalSpent: number;
    perPerson: number;
    balances: Balance[];
  }