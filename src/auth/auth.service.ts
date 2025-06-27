import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dtos/signup.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';

interface JWTUserPayload {
  id: string;
}

interface UserProps {
  _id: string;
  name: string;
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async signup(signupData: SignupDto) {
    const { name, email, password } = signupData;
    // Check if email in use
    const emailInUse = await this.UserModel.findOne({
      email,
    });
    if (emailInUse) {
      throw new BadRequestException('Email already in use');
    }
    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create user document and save in mongodb

    await this.UserModel.create({
      name,
      email,
      password: hashedPassword,
    });
  }

  async login(credentials: { email: string; password: string }) {
    const { email, password } = credentials;
    // Find if user exists by email
    const user: UserProps | null = await this.UserModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    console.log('User found:', user);
    const userId: string = user._id.toString();
    // Compare entered password with existing hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    //Generate JWT tokens
    console.log('User logged in:', user._id);
    return this.generateUserTokens(userId);
  }

  generateUserTokens(userId: string) {
    const payload: JWTUserPayload = { id: userId };
    console.log('Generating tokens for user:', payload);
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    return {
      accessToken,
    };
  }
}
