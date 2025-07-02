import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';
import { AuthGuard } from './auth/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller()
export class AppController {
  getHello(): any {
    throw new Error('Method not implemented.');
  }
  constructor(private readonly appService: AppService) {}

  @Get()
  someProtectedRoute(@Req() req: Request & { userId?: string }) {
    return { message: 'Accessed Resource', userId: req.userId };
  }
}
