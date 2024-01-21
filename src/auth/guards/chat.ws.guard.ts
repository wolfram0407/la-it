import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
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

    canActivate(context: ExecutionContext): any {
        const token = context.switchToWs().getClient().handshake.auth.token;
        console.log('token', token);

        try {
            const verifyToken = async (token: string): Promise<boolean | Error> => {
                const verify = jwt.verify(token, process.env.JWT_SECRET_KEY);
                console.log('verify', verify, typeof verify.sub);
                const userId = verify.sub;
                if (!verify) {
                    throw new UnauthorizedException('인증이 유효하지 않습니다. ');
                } else {
                    const user = await this.userService.findByKakaoIdGetUserName(+userId);
                    context.switchToWs().getData().user = user;

                    console.log('user', user);
                    return true;
                }
            };
            verifyToken(token);
        } catch (err) {
            throw new UnauthorizedException('인증이 유효하지 않습니다. ');
        }
    }
}
