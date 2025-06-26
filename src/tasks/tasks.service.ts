import { Injectable } from '@nestjs/common';
import { Task, TaskDocument } from './schemas/task.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) {}

  async getAllTasks() {
    const tasks = await this.taskModel.find().exec();
    return tasks;
  }

  async getTaskById(id: string) {
    return this.taskModel.findOne({ id }).exec();
  }

  async create(task: Task): Promise<Task> {
    const createdTask = new this.taskModel(task);
    return createdTask.save();
  }

  async update(id: string, task: Task): Promise<Task | null> {
    const found = await this.getTaskById(id);
    if (!found) return null;
    return this.taskModel.findOneAndUpdate({ id }, task, { new: true });
  }

  async delete(id: string): Promise<{ message: string }> {
    const task = await this.getTaskById(id);
    if (!task) {
      return { message: 'Task not found' };
    }
    await this.update(id, { ...task, deleted: true });
    return { message: 'Task deleted successfully' };
  }
}
