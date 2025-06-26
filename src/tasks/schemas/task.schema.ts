import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type TaskDocument = Task & Document;

@Schema()
export class Task {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true, unique: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: false })
  deleted?: boolean;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
