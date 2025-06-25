import { Injectable } from '@nestjs/common';
import { Task, TaskDocument } from './schemas/task.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// import { Task } from './dto/task.model';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) {}

  // tasks: { id: string; title: string; description: string }[] = [];

  async getAllTasks() {
    const tasks = await this.taskModel.find().exec();
    return tasks;
  }

  async getTaskById(id: string) {
    return this.taskModel.findOne({ id }).exec();
  }

  async createTask(task: Task): Promise<Task> {
    const createdTask = new this.taskModel(task);
    return createdTask.save();
  }
}
