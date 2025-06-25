import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './dto/task.model';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  getTasks(): Promise<Task[]> {
    return this.tasksService.getAllTasks();
  }

  // @Get()
  // async getTasks() {
  //   return this.tasksService.getAllTasks();
  // }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Task | null> {
    return this.tasksService.getTaskById(id);
  }

  @Post()
  async createTask(@Body() task: Task): Promise<Task> {
    return this.tasksService.createTask(task);
  }
}
