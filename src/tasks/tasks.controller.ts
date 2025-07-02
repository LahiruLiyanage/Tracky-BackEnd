import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Task } from './schemas/task.schema';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  // @Get()
  // getTasks(): Promise<Task[]> {
  //   return this.tasksService.getAllTasks();
  // }

  @Get('all/:id')
  @UseGuards(AuthGuard)
  getTasks(@Param('id') id: string) {
    console.log('User ID:', id);
    return this.tasksService.getTasksByUserId(id);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string): Promise<Task | null> {
    return this.tasksService.getTaskById(id);
  }

  // @Post()
  // async createTask(@Body() task: Task): Promise<Task> {
  //   return this.tasksService.create(task);
  // }

  @Post()
  @UseGuards(AuthGuard)
  async createTask(@Body() task: Task, @Req() req): Promise<Task> {
    task.userId = req.user.userId;
    return this.tasksService.create(task);
  }

  @Put('update/:id')
  async updateTask(@Param('id') id: string, @Body() task: any): Promise<any> {
    console.log('Updating task with ID:', id);
    console.log('Task data:', task);
    return this.tasksService.update(id, task);
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: string): Promise<{ message: string }> {
    const task = await this.tasksService.getTaskById(id);
    if (task) {
      return this.tasksService.delete(id);
    }
    return { message: 'Task not found' };
  }
}
