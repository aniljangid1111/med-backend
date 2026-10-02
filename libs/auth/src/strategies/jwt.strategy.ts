import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { User } from '@user/user/enitity/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(AuthService) private authService: AuthService,
    @Inject(ConfigService) private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService?.get<string>('JWT_SECRET') || process.env.JWT_SECRET || 'secret',
    });
  }

  async validate(payload: { sub: string }): Promise<User> {
    const user = await this.authService.validateJwt(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
