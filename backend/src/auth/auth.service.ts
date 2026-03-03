import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt'; 

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) throw new ConflictException('Użytkownik już istnieje!');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const newUser = await this.prisma.user.create({
      data: { email: dto.email, name: dto.name, password: hashedPassword },
    });

    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  // --- TO JEST NOWA CZĘŚĆ (Logowanie) ---
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Nieprawidłowy email lub hasło');
    }

    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };
  }
}