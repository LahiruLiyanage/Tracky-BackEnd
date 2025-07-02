import { BadRequestException, Injectable } from '@nestjs/common';
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

  async update(id: string, task: Task) {
    const found = await this.getTaskById(id);
    if (!found) {
      throw new BadRequestException('Task not found');
    }

    const updatedTask = this.taskModel.updateOne({
      id: id,
      $set: {
        completed: task.completed,
      },
    });

    console.log(updatedTask, 'Updated Task');

    if (!updatedTask) {
      throw new BadRequestException('Failed to update task');
    }
    return updatedTask;
  }

  async delete(id: string): Promise<{ message: string }> {
    console.log('Deleting task:', id);
    const task = await this.getTaskById(id);
    if (!task) {
      return { message: 'Task not found' };
    }
    await this.taskModel.deleteOne({ _id: task._id });
    return { message: 'Task deleted successfully' };
  }

  async getTasksByUserId(userId: string): Promise<Task[]> {
    return this.taskModel.find({ userId }).exec();
  }
}
