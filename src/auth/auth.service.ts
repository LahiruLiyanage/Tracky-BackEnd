import { BadRequestException, Injectable } from '@nestjs/common';
import { SignupDto } from './dtos/signup.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private UserModel: Model<User>) {}

  async signup(signupData: SignupDto) {
    const { email, password } = signupData;
    // Check if email in use
    const emailInUse = await this.UserModel.findOne({
      email,
    });
    if (emailInUse) {
      throw new BadRequestException('Email already in use');
    }
    // Hash Password
    const hashedPassword = bcrypt.hash(password, 10);
    // Create user document and save in mongodb

    await this.UserModel.create({
      name,
      email,
      password: hashedPassword,
    });
  }
}
