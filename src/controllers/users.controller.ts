import { CurrentUser } from '@auth/auth/decorator/current-user.decorator';
import { Public } from '@auth/auth/decorator/public.decorator';
import { FirebaseService } from '@auth/auth/firebase.service';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  Post,
  Put,
} from '@nestjs/common';
import { UserService } from '@user/user';
import { UpdateUserInfoDto } from '@user/user/dto/update-user-info.dto';
import { User } from '@user/user/enitity/user.entity';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UserService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Get('profile')
  getProfile(@CurrentUser() user: User) {
    return this.userService.findOne(user.id);
  }

  @Put('profile')
  updateProfile(
    @Body() updateProfileDto: UpdateUserInfoDto,
    @CurrentUser() user: User,
  ) {
    return this.userService.update(user.id, updateProfileDto);
  }

  @Delete('profile')
  async deleteProfile(@CurrentUser() user: User) {
    const fullUser = await this.userService.findOne(user.id);

    // 1. Delete from Firebase if linked
    if (fullUser.firebaseUid) {
      await this.firebaseService.deleteUser(fullUser.firebaseUid);
    }

    // 2. Soft delete from our DB
    await this.userService.remove(user.id);

    return { success: true, message: 'Account deleted successfully' };
  }

  @Public()
  @Post('sync-firebase-deletion')
  async syncFirebaseDeletion(
    @Body('uid') uid: string,
    @Headers('x-sync-secret') secret: string,
  ) {
    // Security check using a shared secret
    if (secret !== process.env.FIREBASE_SYNC_SECRET) {
      throw new ForbiddenException('Invalid sync secret');
    }

    await this.userService.removeByFirebaseUid(uid);
    return { success: true };
  }
}
