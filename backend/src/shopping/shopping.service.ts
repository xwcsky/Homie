import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShoppingService {
  constructor(private prisma: PrismaService) {}

  // Pomocnicza metoda do szukania mieszkania użytkownika
  private async getFlatId(userId: number) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId },
    });
    if (!membership) throw new BadRequestException('Nie należysz do żadnego mieszkania');
    return membership.flatId;
  }

  // 1. Dodaj produkt do listy
  async create(userId: number, name: string) {
    const flatId = await this.getFlatId(userId);
    return this.prisma.shoppingItem.create({
      data: { name, flatId },
    });
  }

  // 2. Pobierz listę zakupów
  async findAll(userId: number) {
    const flatId = await this.getFlatId(userId);
    return this.prisma.shoppingItem.findMany({
      where: { flatId },
      include: { buyer: { select: { name: true } } }, // Pobieramy imię kupującego
      orderBy: { createdAt: 'desc' }
    });
  }

  // 3. Odznacz/Zaznacz produkt jako kupiony
  async update(userId: number, id: number, isBought: boolean) {
    const flatId = await this.getFlatId(userId);
    const item = await this.prisma.shoppingItem.findFirst({ where: { id, flatId } });
    if (!item) throw new NotFoundException('Brak produktu');

    return this.prisma.shoppingItem.update({
      where: { id },
      data: {
        isBought,
        buyerId: isBought ? userId : null, // Jeśli zaznaczasz, przypisuje Ciebie jako kupującego
      },
    });
  }

  // 4. Zwykłe usunięcie z listy
  async remove(userId: number, id: number) {
    const flatId = await this.getFlatId(userId);
    const item = await this.prisma.shoppingItem.findFirst({ where: { id, flatId } });
    if (!item) throw new NotFoundException('Brak produktu');

    return this.prisma.shoppingItem.delete({ where: { id } });
  }

  // 🔥 5. KILLER FEATURE: Zamień zakupy na rachunek!
  async convertToBill(userId: number, id: number, amount: number) {
    const flatId = await this.getFlatId(userId);
    const item = await this.prisma.shoppingItem.findFirst({ where: { id, flatId } });
    if (!item) throw new NotFoundException('Brak produktu');

    // A. Tworzymy rachunek w module Finansów
    const bill = await this.prisma.bill.create({
      data: {
        title: item.name,   // Nazwa z listy zakupów (np. "Mleko i chleb")
        amount: amount,     // Kwota, którą podał użytkownik
        payerId: userId,    // Kto płacił
        flatId: flatId,
      },
    });

    // B. Usuwamy pozycję z listy zakupów (bo już jest rozliczona)
    await this.prisma.shoppingItem.delete({ where: { id } });

    return bill;
  }
}