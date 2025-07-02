import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type TaskDocument = Task & Document;

@Schema()
export class Task {
  @Prop({ required: false, unique: true })
  id: string;

  @Prop({ required: true, unique: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: false })
  deleted?: boolean;

  @Prop({ required: false, unique: true })
  userId: string;

  @Prop({ default: false })
  completed: boolean;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
