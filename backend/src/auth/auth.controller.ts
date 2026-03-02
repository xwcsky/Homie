import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth') // To oznacza, że endpointy zaczynają się od /auth
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register') // Pełny adres to: POST /auth/register
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }
}