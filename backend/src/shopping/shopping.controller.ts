import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ShoppingService } from './shopping.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('shopping')
export class ShoppingController {
  constructor(private readonly shoppingService: ShoppingService) {}

  @Post()
  create(@Request() req, @Body('name') name: string) {
    return this.shoppingService.create(req.user.userId, name);
  }

  @Get()
  findAll(@Request() req) {
    return this.shoppingService.findAll(req.user.userId);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body('isBought') isBought: boolean) {
    return this.shoppingService.update(req.user.userId, +id, isBought);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.shoppingService.remove(req.user.userId, +id);
  }

  // 🔥 Nasz specjalny endpoint do konwersji
  @Post(':id/convert')
  convertToBill(@Request() req, @Param('id') id: string, @Body('amount') amount: number) {
    return this.shoppingService.convertToBill(req.user.userId, +id, Number(amount));
  }
}