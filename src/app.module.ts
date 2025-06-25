import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { TasksModule } from './tasks/tasks.module';

// const uri =
//   'mongodb+srv://lahirul:farc35wlD1JM124R@cluster0.frhslxf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
// const client = new MongooseModule(uri);

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://lahirul:farc35wlD1JM124R@cluster0.frhslxf.mongodb.net/Tasks?retryWrites=true&w=majority&appName=Cluster0',
    ),
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
