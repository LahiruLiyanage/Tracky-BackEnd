import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type TaskDocument = Task & Document;

@Schema()
export class Task {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
