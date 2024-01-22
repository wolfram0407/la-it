import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const WsUserInfo = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    console.log('wsUserInfo_data', data);
    const request = ctx.switchToWs().getData().user;
    console.log('wsUserInfo_request', request);

    return request;
});
