import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@user/user/enitity/user.entity';
import { Request } from 'express';

interface CurrentUser extends Request {
  user: User;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<CurrentUser>();
    return request.user;
  },
);
