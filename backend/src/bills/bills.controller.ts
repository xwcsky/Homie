import { Controller, Get, Post, Body, UseGuards, Request, Delete } from '@nestjs/common';
import { BillsService } from './bills.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Delete('clear')
  clearAll(@Request() req) {
    return this.billsService.clearAll(req.user.userId);
  }

  @Get('summary')
  getSummary(@Request() req) {
    return this.billsService.getSummary(req.user.userId);
  }

  @Post()
  create(@Request() req, @Body() createBillDto: CreateBillDto) {
    // Konwertujemy amount na liczbę (czasami przychodzi jako string)
    const dto = { ...createBillDto, amount: Number(createBillDto.amount) };
    return this.billsService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.billsService.findAll(req.user.userId);
  }

  
}