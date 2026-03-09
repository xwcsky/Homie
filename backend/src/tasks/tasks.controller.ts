import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateTaskDto } from './dto/update-task.dto';

@UseGuards(JwtAuthGuard) // <--- Cały kontroler tylko dla zalogowanych
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(
    @Request() req, 
    @Body('title') title: string,
    @Body('assignedToId') assignedToId?: number,
    @Body('date') date?: string,
    @Body('isWeekly') isWeekly?: boolean 
  ) {
    return this.tasksService.create(req.user.userId, title, assignedToId, date, isWeekly);
  }

  @Get()
  findAll(@Request() req) {
    return this.tasksService.findAllMyTasks(req.user.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Request() req) {
    return this.tasksService.update(+id, req.user.userId, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.tasksService.remove(+id, req.user.userId);
  }
}