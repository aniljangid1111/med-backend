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
import { AuthService } from './auth.service';
import { CreateUserDto } from '@user/user/dto/create-user.dto';
import { RefreshTokenDto } from './dto/auth.dto';
import { LocalAuthGuard } from './guards/local-auth/local-auth.gaurd';
import { JwtAuthGuard } from './guards/jws-auth/jwt-auth.guard';
import { Public } from './decorator/public.decorator';
import { CurrentUser } from './decorator/current-user.decorator';
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
  @HttpCode(HttpStatus.OK)
  async login(@CurrentUser() user: User) {
    return this.authService.login(user);
  }

  @Public()
  @Post('google-login')
  @HttpCode(HttpStatus.OK)
  async googleLogin(@Body('token') token: string) {
    return this.authService.loginWithGoogle(token);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
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
}
