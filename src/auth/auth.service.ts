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
import { RefreshToken } from './schemas/refresh.token.schema';
import { v4 as uuidv4 } from 'uuid';

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
    @InjectModel(RefreshToken.name)
    private RefreshTokenModel: Model<RefreshToken>,
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
    const userId: string = user._id.toString();
    // console.log('User ID:', userId);
    // Compare entered password with existing hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    //Generate JWT tokens
    const tokens = await this.generateUserTokens(userId);
    return {
      ...tokens,
      userId: user._id,
    };
  }

  async refreshTokens(refreshToken: string) {
    const token = await this.RefreshTokenModel.findOne({
      token: refreshToken,
      expiryDate: { $gte: new Date() },
    });

    if (!token) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return this.generateUserTokens(token.userId);
  }

  async generateUserTokens(userId: string) {
    const accessToken = this.jwtService.sign({ userId }, { expiresIn: '1h' });

    const refreshToken = uuidv4();

    // console.log('Generating tokens for user ID:', userId);
    await this.storeRefreshToken(refreshToken, userId);
    return {
      accessToken,
      refreshToken,
    };
  }

  async storeRefreshToken(token: string, userId: string) {
    // console.log('Storing refresh token for user ID:', userId);
    // console.log('Token:', token);
    //Calculating expiry date 3 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    await this.RefreshTokenModel.updateOne(
      { userId },
      { $set: { expiryDate, token } },
      {
        upsert: true,
      },
    );
  }
}
