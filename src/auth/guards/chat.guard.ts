import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WsGuard implements CanActivate {
    constructor(
        private userService: UserService,
        private readonly configService: ConfigService,
    ) {}
    private readonly secretKey = this.configService.get<string>('JWT_SECRET_KEY');

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const token = context.switchToWs().getClient().handshake.auth.token;
        try {
            const verifyToken = async (token: string): Promise<any> => {
                const verify = jwt.verify(token, process.env.JWT_SECRET_KEY);
                console.log('가드가드', token);
                console.log(verify);
                const userId = verify.sub;

                if (!verify) {
                    throw new UnauthorizedException('인증이 유효하지 않습니다. ');
                } else {
                    //next()
                    const findUser = await this.userService.findByUserIdGetUserName(+userId);
                    console.log('findUser', findUser);
                    context.switchToWs().getClient().handshake.auth.user = findUser; //TypeError: Cannot create property 'user' on string 'first'
                    return true;
                }
            };
            return await verifyToken(token);
        } catch (err) {
            return false;
        }
    }
}
