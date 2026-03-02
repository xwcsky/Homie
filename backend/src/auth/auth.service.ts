import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    // 1. Sprawdzenie, czy email jest już w bazie
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Użytkownik z tym adresem email już istnieje!');
    }

    // 2. Szyfrowanie hasła (10 to tzw. salt rounds - standardowy poziom bezpieczeństwa)
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Zapisanie użytkownika w Supabase
    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
      },
    });

    // 4. Oddzielenie hasła od reszty danych (nie chcemy go odsyłać na frontend!)
    const { password, ...userWithoutPassword } = newUser;
    
    return userWithoutPassword;
  }
}