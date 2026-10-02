import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './enitity/user.entity';
import { ResetCode } from './enitity/reset-code.entity';
import { MoreThan, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserInfoDto } from './dto/update-user-info.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ResetCode)
    private readonly resetCodeRepository: Repository<ResetCode>,
  ) {}

  async createResetCode(email: string, code: string): Promise<ResetCode> {
    // Delete any existing codes for this email
    await this.resetCodeRepository.delete({ email });
    
    const resetCode = this.resetCodeRepository.create({
      email,
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });
    return this.resetCodeRepository.save(resetCode);
  }

  async getResetCode(email: string, code: string): Promise<ResetCode | null> {
    return this.resetCodeRepository.findOne({
      where: {
        email,
        code,
        expiresAt: MoreThan(new Date()),
      },
    });
  }

  async deleteResetCode(email: string): Promise<void> {
    await this.resetCodeRepository.delete({ email });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!email) {
      return null;
    }
    return this.userRepository.findOneBy({ email });
  }

  async update(id: string, updateUserDto: UpdateUserInfoDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.bloodGroup === ('' as any)) {
      updateUserDto.bloodGroup = null as any;
    }

    return await this.userRepository.save(
      this.userRepository.merge(user, updateUserDto),
    );
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.softDelete(user.id);
  }

  async removeByFirebaseUid(uid: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ firebaseUid: uid });
    if (user) {
      await this.userRepository.softDelete(user.id);
    }
  }
}
