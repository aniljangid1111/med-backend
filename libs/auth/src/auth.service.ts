import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@user/user';
import { CreateUserDto } from '@user/user/dto/create-user.dto';
import { User } from '@user/user/enitity/user.entity';
import { compare, hash } from 'bcrypt';
import { FirebaseService } from './firebase.service';
import { MailService } from '@app/mail';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: any;
  tokens: AuthTokens;
  message?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  private refreshTokens: Map<string, string> = new Map(); // In production, use Redis or database

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly firebaseService: FirebaseService,
    private readonly mailService: MailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.userService.getUserByEmail(email);
    console.log('DEBUG: User found for login:', email, !!user);

    if (!user) {
      this.logger.warn(`Login failed: Email not registered: ${email}`);
      throw new NotFoundException('Email not registered');
    }

    if (user.deletedAt) {
      this.logger.warn(`Login failed: User record is soft-deleted: ${email}`);
      return null;
    }

    const isPasswordMatching = await compare(pass, user.password);
    console.log('DEBUG: Password matches:', isPasswordMatching);

    if (isPasswordMatching) {
      return {
        ...user,
        password: '', // Exclude password from the response
      };
    }
    this.logger.warn(`Login failed: Incorrect password for: ${email}`);
    return null;
  }

  async validateJwt(userId: string): Promise<User> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return { ...user, password: '' };
  }

  async validateRefreshToken(refreshToken: string): Promise<User> {
    try {
      const payload = this.jwtService.verify<{ sub?: string }>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET!,
      });

      if (!payload.sub) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const storedToken = this.refreshTokens.get(payload.sub);
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.validateJwt(payload.sub);
    } catch (error: unknown) {
      this.logger.error(error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async registerUser(
    userDto: CreateUserDto,
  ): Promise<LoginResponse> {
    // Check if user already exists
    const existingUser = await this.userService.getUserByEmail(userDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await hash(userDto.password, 12);
    const user = await this.userService.create({
      ...userDto,
      password: hashedPassword,
    });
    const tokens = await this.generateTokens(user);
    return {
      user: {
        ...user,
        password: '',
      },
      tokens,
      message: `Welcome to Meditrack, ${user.name}! We are excited to help you on your health journey.`,
    };
  }

  async login(user: User): Promise<LoginResponse> {
    const tokens = await this.generateTokens(user);

    // Store refresh token
    this.refreshTokens.set(user.id, tokens.refreshToken);

    return {
      user: { ...user, password: undefined },
      tokens,
      message: `Welcome back, ${user.name}! We are glad to see you again.`,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const user = await this.validateRefreshToken(refreshToken);

    // Remove old refresh token
    this.refreshTokens.delete(user.id);

    // Generate new tokens
    const tokens = await this.generateTokens(user);

    // Store new refresh token
    this.refreshTokens.set(user.id, tokens.refreshToken);

    return tokens;
  }

  logout(userId: string): { message: string } {
    // Remove refresh token
    this.refreshTokens.delete(userId);

    return { message: 'Logged out successfully' };
  }

  async loginWithGoogle(token: string): Promise<LoginResponse> {
    try {
      const decodedToken = await this.firebaseService.verifyIdToken(token);
      const { email, name, picture, uid } = decodedToken;

      if (!email) {
        throw new UnauthorizedException('Email not provided by Google');
      }

      let user = await this.userService.getUserByEmail(email);

      if (!user) {
        // Create new user if they don't exist
        user = await this.userService.create({
          email,
          name: name || '',
          firebaseUid: uid,
          password: '', // No password for Google users
          gender: '',
          dateOfBirth: null,
          isEmailVerified: true,
          alertTime: new Date(),
        } as any);
      } else if (!user.firebaseUid) {
        // Sync firebaseUid for existing users
        user = await this.userService.update(user.id, {
          firebaseUid: uid,
        } as any);
      }

      const tokens = await this.generateTokens(user);
      this.refreshTokens.set(user.id, tokens.refreshToken);

      return {
        user: { ...user, password: undefined },
        tokens,
        message: `Welcome back, ${user.name}! We are glad to see you again.`,
      };
    } catch (error) {
      this.logger.error('Google login failed:', error);
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      // For security, don't reveal if user exists
      return { message: 'If an account exists with this email, a reset code has been sent.' };
    }

    try {
      // Generate 6-digit pin
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store in DB
      await this.userService.createResetCode(email, pin);
      
      // Send real email
      await this.mailService.sendResetPasswordEmail(email, pin);
      
      // Log for testing
      this.logger.log(`******************************************`);
      this.logger.log(`PASSWORD RESET PIN FOR ${email}: ${pin}`);
      this.logger.log(`******************************************`);
      
      return { message: 'If an account exists with this email, a reset code has been sent.' };
    } catch (error: any) {
      this.logger.error(`Forgot password failed for ${email}`, error.message);
      throw new ConflictException(`Password reset failed: ${error.message}`);
    }
  }

  async verifyResetCode(email: string, code: string): Promise<{ resetToken: string }> {
    if (!email || !code) {
      throw new BadRequestException('Email and PIN code are required.');
    }

    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const resetCode = await this.userService.getResetCode(email, code);
    if (!resetCode) {
      throw new BadRequestException('Invalid or expired reset code.');
    }

    // Generate a temporary reset token (JWT)
    console.log(`DEBUG: [verifyResetCode] Generating token for ID: ${user.id} and email: ${email}`);
    const resetToken = await this.jwtService.signAsync(
      { 
        email: email, // Explicitly set email
        sub: user.id, 
        type: 'password_reset' 
      },
      {
        secret: process.env.JWT_RESET_SECRET || 'password-reset-secret-key-12345',
        expiresIn: '15m',
      },
    );

    return { resetToken };
  }

  async resetPassword(email: string, resetToken: string, newPassword: string): Promise<{ message: string }> {
    if (!resetToken) {
      throw new BadRequestException('Password reset token is required.');
    }

    try {
      // 1. Verify the Reset Token
      const secret = process.env.JWT_RESET_SECRET || 'password-reset-secret-key-12345';
      const payload = await this.jwtService.verifyAsync(resetToken, { secret });

      console.log('DEBUG: Reset Token Payload:', payload);
      console.log('DEBUG: Provided Email:', email);

      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        throw new NotFoundException('User not found.');
      }

      console.log('DEBUG: Reset Token Payload Sub:', payload.sub);
      console.log('DEBUG: User ID from DB:', user.id);

      if (payload.type !== 'password_reset' || payload.sub !== user.id) {
        this.logger.error(`Reset token mismatch: Expected User ID ${payload.sub}, Got ${user.id}`);
        throw new BadRequestException('Invalid reset token: Identity mismatch.');
      }

      // 1. Update Firebase
      if (user.firebaseUid) {
        await this.firebaseService.updatePassword(user.firebaseUid, newPassword);
      }

      // 2. Update Database
      const hashedPassword = await hash(newPassword, 12);
      await this.userService.update(user.id, {
        password: hashedPassword,
      } as any);

      // 3. Cleanup code
      await this.userService.deleteResetCode(email);

      // 4. Send Success Email
      await this.mailService.sendPasswordResetSuccessEmail(email);

      return { message: 'Password has been reset successfully.' };
    } catch (error: any) {
      this.logger.error(`Reset password failed for ${email}`, error.message);
      throw new BadRequestException(`Reset failed: ${error.message}`);
    }
  }

  async changePassword(userId: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    try {
      // 1. Update Firebase
      if (user.firebaseUid) {
        await this.firebaseService.updatePassword(user.firebaseUid, newPassword);
      }

      // 2. Update Database
      const hashedPassword = await hash(newPassword, 12);
      await this.userService.update(user.id, {
        password: hashedPassword,
      } as any);

      // 3. Send Success Email
      console.log(`DEBUG: [changePassword] Sending success email to: ${user.email}`);
      await this.mailService.sendPasswordResetSuccessEmail(user.email);

      return { message: 'Password has been changed successfully.' };
    } catch (error: any) {
      this.logger.error(`Change password failed for ${user.email}`, error.message);
      throw new BadRequestException(`Change failed: ${error.message}`);
    }
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload = {
      email: user.email,
      sub: user.id,
      iat: Math.floor(Date.now() / 1000),
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET || 'secret',
      expiresIn: '120m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
