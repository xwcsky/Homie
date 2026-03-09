import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { FlatsService } from './flats.service';
import { CreateFlatDto } from './dto/create-flat.dto';
import { UpdateFlatDto } from './dto/update-flat.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { JoinFlatDto } from './dto/join-flat.dto';

@Controller('flats')
export class FlatsController {
  constructor(private readonly flatsService: FlatsService) {}

  @UseGuards(JwtAuthGuard) // 1. Tylko dla zalogowanych!
  @Post()
  create(@Body() createFlatDto: CreateFlatDto, @Request() req) {
    // 2. Wyciągamy ID użytkownika z tokena (req.user.userId)
    const userId = req.user.userId;
    return this.flatsService.create(createFlatDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMyFlat(@Request() req) {
    return this.flatsService.findMyFlat(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('board')
  updateBoard(@Request() req, @Body() body: any) {
    return this.flatsService.updateBoard(req.user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('generate-code')
  generateNewCode(@Request() req) {
    return this.flatsService.generateNewCode(req.user.userId);
  }

  @Get()
  findAll() {
    return this.flatsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.flatsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFlatDto: UpdateFlatDto) {
    return this.flatsService.update(+id, updateFlatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.flatsService.remove(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('join')
  join(@Body() joinFlatDto: JoinFlatDto, @Request() req) {
    return this.flatsService.join(req.user.userId, joinFlatDto);
  }

  
}