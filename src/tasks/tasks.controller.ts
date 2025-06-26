import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './dto/task.model';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  getTasks(): Promise<Task[]> {
    return this.tasksService.getAllTasks();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Task | null> {
    return this.tasksService.getTaskById(id);
  }

  @Post()
  async createTask(@Body() task: Task): Promise<Task> {
    return this.tasksService.create(task);
  }

  @Put(':id')
  async updateTask(
    @Param('id') id: string,
    @Body() task: Task,
  ): Promise<Task | null> {
    return this.tasksService.update(id, task);
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: string): Promise<{ message: string }> {
    const task = await this.tasksService.getTaskById(id);
    if (!task) {
      return { message: 'Task not found' };
    }
    await this.tasksService.update(id, { ...task, deleted: true });
    return { message: 'Task deleted successfully' };
  }
}
