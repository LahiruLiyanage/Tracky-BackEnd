import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
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
import { nanoid } from 'nanoid';
import { ResetToken } from './schemas/reset-token.schema';
import { MailService } from './services/mail.service';

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
    @InjectModel(ResetToken.name)
    private ResetTokenModel: Model<ResetToken>,
    private jwtService: JwtService,
    private mailService: MailService, // Injecting MailService to send emails
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

    return this.generateUserTokens(token.userId.toString());
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
    expiryDate.setDate(expiryDate.getDate() + 5);

    await this.RefreshTokenModel.updateOne(
      { userId },
      { $set: { expiryDate, token } },
      {
        upsert: true,
      },
    );
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    //Find the User
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Compare the old password with password in DB
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Old password is incorrect');
    }

    // Change user's password (Need to Hash this)
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = newHashedPassword;
    await user.save();
    return {
      message: 'Password changed successfully',
    };
  }

  async forgotPassword(email: string) {
    // Check that user exists with the given email
    const user = await this.UserModel.findOne({ email });
    //If user exists, generate password reset link
    if (user) {
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 3); // 1 hour expiry

      // Using nanoid package
      const resetToken = nanoid(64);
      await this.ResetTokenModel.create({
        token: resetToken,
        userId: user._id,
        expiryDate,
      });

      // Send the link to the user's email (Using nodemailer)
      void this.mailService.sendPasswordResetEmail(email, resetToken);
    }

    return {
      message:
        'If the email is registered, a password reset link has been sent.',
    };
  }

  async resetPassword(resetToken: string, newPassword: string) {
    // Find the valid reset token Document from the DB
    const token = await this.ResetTokenModel.findOne({
      token: resetToken,
      expiryDate: { $gte: new Date() },
    });
    // If token is not found or expired, throw an error
    if (!token) {
      throw new UnauthorizedException('Invalid or expired reset link');
    }

    // Change the user password if the token is valid and make it Hashed
    const user = await this.UserModel.findById(token.userId);
    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Delete the reset token after successful password reset for security
    await this.ResetTokenModel.deleteOne({ _id: token._id });

    return {
      message: 'Password reset successfully',
    };
  }
}
