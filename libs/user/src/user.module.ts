import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './enitity/user.entity';
import { ResetCode } from './enitity/reset-code.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, ResetCode])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
