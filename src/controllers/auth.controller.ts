import { AuthService, JwtAuthGuard, LocalAuthGuard } from '@auth/auth';
import { Public } from '@auth/auth/decorator/public.decorator';
import { CurrentUser } from '@auth/auth/decorator/current-user.decorator';
import { RefreshTokenDto, ChangePasswordDto } from '@auth/auth/dto/auth.dto';
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { CreateUserDto } from '@user/user/dto/create-user.dto';

import { User } from '@user/user/enitity/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.registerUser(createUserDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@CurrentUser() user: User) {
    return this.authService.login(user);
  }

  @Public()
  @Post('google-login')
  @HttpCode(HttpStatus.OK)
  async googleLogin(@Body('token') token: string) {
    console.log('DEBUG: Received token length:', token?.length);
    console.log('DEBUG: Received token snippet:', token?.substring(0, 20));
    return this.authService.loginWithGoogle(token);
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: User) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@CurrentUser() user: User) {
    return this.authService.logout(user.id);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Public()
  @Post('verify-pin')
  async verifyPin(
    @Body('email') email: string,
    @Body('code') code: string,
  ) {
    return this.authService.verifyResetCode(email, code);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(
    @Body('email') email: string,
    @Body('resetToken') resetToken: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(email, resetToken, newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, changePasswordDto.newPassword);
  }
}
