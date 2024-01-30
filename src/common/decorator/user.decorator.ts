import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const UserInfo = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    console.log('req.user', request.user);
    return request.user;
});
