import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateBillDto } from './dto/create-bill.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillsService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: number) {
    // 1. Znajdź moje mieszkanie
    const myMembership = await this.prisma.membership.findFirst({
      where: { userId },
    });
    if (!myMembership) throw new BadRequestException('Nie masz mieszkania!');

    const flatId = myMembership.flatId;

    // 2. Pobierz WSZYSTKIE rachunki w tym mieszkaniu
    const allBills = await this.prisma.bill.findMany({
      where: { flatId },
    });

    // 3. Pobierz WSZYSTKICH mieszkańców
    const allMembers = await this.prisma.membership.findMany({
      where: { flatId },
      include: { user: { select: { id: true, name: true } } }
    });

    // --- MATEMATYKA ---

    // A. Suma całkowita wydatków
    const totalSpent = allBills.reduce((sum, bill) => sum + bill.amount, 0);

    // B. Ile wychodzi "na głowę" (split)
    const splitAmount = totalSpent / allMembers.length;

    // C. Liczymy saldo dla każdego
    const balances = allMembers.map(member => {
      // Ile ten konkretny użytkownik zapłacił łącznie?
      const paidByMember = allBills
        .filter(bill => bill.payerId === member.user.id)
        .reduce((sum, bill) => sum + bill.amount, 0);

      // Saldo: Ile zapłacił MINUS ile powinien zapłacić
      // Wynik dodatni -> Inni mu wiszą
      // Wynik ujemny -> On wisi innym
      const balance = paidByMember - splitAmount;

      return {
        userId: member.user.id,
        name: member.user.name,
        paid: parseFloat(paidByMember.toFixed(2)), // Zaokrąglamy do 2 miejsc
        balance: parseFloat(balance.toFixed(2)),
        status: balance >= 0 ? 'OWED' : 'OWES' // Status tekstowy
      };
    });

    return {
      totalSpent: parseFloat(totalSpent.toFixed(2)),
      perPerson: parseFloat(splitAmount.toFixed(2)),
      balances: balances
    };
  }

  async create(userId: number, createBillDto: CreateBillDto) {
    // 1. Sprawdzamy, w jakim mieszkaniu jest płacący
    const membership = await this.prisma.membership.findFirst({
      where: { userId: userId },
    });

    if (!membership) {
      throw new BadRequestException('Musisz mieć mieszkanie, żeby dodawać rachunki!');
    }

    // 2. Tworzymy rachunek
    return this.prisma.bill.create({
      data: {
        title: createBillDto.title,
        amount: createBillDto.amount,
        payerId: userId,           // Ja płaciłem
        flatId: membership.flatId, // W moim mieszkaniu
      },
    });
  }

  // Pobierz wszystkie rachunki w mieszkaniu
  async findAll(userId: number) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId: userId },
    });

    if (!membership) return [];

    return this.prisma.bill.findMany({
      where: { flatId: membership.flatId },
      include: {
        payer: { // Chcemy widzieć imię osoby, która płaciła
          select: { name: true, email: true } 
        }
      },
      orderBy: { createdAt: 'desc' } // Najnowsze na górze
    });
  }

  async clearAll(userId: number) {
    // 1. Pobieramy ID mieszkania (użyj swojej metody na pobieranie flatId)
    const membership = await this.prisma.membership.findFirst({
      where: { userId },
    });
    if (!membership) throw new BadRequestException('Brak mieszkania');

    // 2. Usuwamy wszystkie rachunki w tym mieszkaniu
    return this.prisma.bill.deleteMany({
      where: { flatId: membership.flatId },
    });
  }
}