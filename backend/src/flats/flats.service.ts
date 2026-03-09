import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateFlatDto } from './dto/create-flat.dto';
import { UpdateFlatDto } from './dto/update-flat.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client'; // Importujemy Enum z Pryzmy
import { JoinFlatDto } from './dto/join-flat.dto';

@Injectable()
export class FlatsService {
  constructor(private prisma: PrismaService) {}

  // Metoda pomocnicza do generowania losowego kodu (np. "A7X2")
  private generateCode(length: number = 6): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Tworzenie mieszkania
  async create(createFlatDto: CreateFlatDto, userId: number) {
    const inviteCode = this.generateCode();

    // Tworzymy Mieszkanie I JEDNOCZEŚNIE przypisujemy twórcę jako ADMINA
    return this.prisma.flat.create({
      data: {
        name: createFlatDto.name,
        code: inviteCode,
        // Tu dzieje się magia relacji:
        memberships: {
          create: {
            userId: userId,
            role: Role.ADMIN, // Ustawiamy rolę ADMIN
          },
        },
      },
      // Chcemy, żeby wynik zwrócił też listę członków
      include: {
        memberships: true,
      },
    });
  }

  async join(userId: number, joinFlatDto: JoinFlatDto) {
    // 1. Szukamy mieszkania po kodzie
    const flat = await this.prisma.flat.findUnique({
      where: { code: joinFlatDto.code },
    });

    // 2. Jak nie ma takiego kodu - błąd 404
    if (!flat) {
      throw new NotFoundException('Nie ma mieszkania z takim kodem!');
    }

    // 3. Próbujemy dodać użytkownika
    try {
      return await this.prisma.membership.create({
        data: {
          userId: userId,
          flatId: flat.id,
          role: Role.MEMBER, // Domyślnie zwykły lokator
        },
      });
    } catch (error) {
      // Jeśli Prisma rzuci błąd (bo np. użytkownik już tam jest - mamy @@unique w bazie)
      if (error.code === 'P2002') {
        throw new BadRequestException('Już należysz do tego mieszkania!');
      }
      throw error;
    }
  }

// --- NOWA METODA: Generowanie nowego kodu zaproszenia ---
async generateNewCode(userId: number) {
  const membership = await this.prisma.membership.findFirst({
    where: { userId },
  });
  if (!membership) throw new BadRequestException('Brak mieszkania');

  // Tworzymy nowy, losowy 6-znakowy kod (litery i cyfry)
  const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  // Zapisujemy nowy kod w bazie
  const updatedFlat = await this.prisma.flat.update({
    where: { id: membership.flatId },
    data: { code: newCode },
  });

  return { message: 'Nowy kod wygenerowany', code: updatedFlat.code };
}

  async findMyFlat(userId: number) {
    return this.prisma.flat.findFirst({
      where: {
        memberships: {
          some: {
            userId: userId, // Szukamy mieszkania, gdzie jednym z członków jest nasz user
          },
        },
      },
      include: {
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true, // Pobieramy tylko bezpieczne dane
              },
            },
          },
        },
      },
    });
  }

  async updateBoard(userId: number, data: { wifiPassword?: string; bankAccount?: string; boardNotes?: string }) {
    // Sprawdzamy, do jakiego mieszkania należy użytkownik
    const membership = await this.prisma.membership.findFirst({
      where: { userId },
    });
    if (!membership) throw new BadRequestException('Brak mieszkania');

    // Aktualizujemy dane mieszkania
    return this.prisma.flat.update({
      where: { id: membership.flatId },
      data: {
        wifiPassword: data.wifiPassword,
        bankAccount: data.bankAccount,
        boardNotes: data.boardNotes,
      }
    });
  }

  findAll() {
    return this.prisma.flat.findMany();
  }

  findOne(id: number) {
    return this.prisma.flat.findUnique({ where: { id } });
  }

  update(id: number, updateFlatDto: UpdateFlatDto) {
    return `This action updates a #${id} flat`;
  }

  remove(id: number) {
    return `This action removes a #${id} flat`;
  }
}