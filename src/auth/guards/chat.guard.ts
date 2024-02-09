import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { WebSocketServer, WsException } from '@nestjs/websockets';
import { Server } from 'socket.io';

@Injectable()
export class WsGuard implements CanActivate {
    //@WebSocketServer() server: Server;

    constructor(
        private userService: UserService,
        private readonly configService: ConfigService,
    ) {}
    private readonly secretKey = this.configService.get<string>('JWT_SECRET_KEY');

    async canActivate(context: ExecutionContext): Promise<boolean> {
        //console.log('토큰 있낟요? ', context.switchToWs().getClient().handshake);
        const token = context.switchToWs().getClient().handshake.auth.token;
        try {
            const verifyToken = async (token: string): Promise<any> => {
                const [tokenType, tokenValue] = token.split(' ');

                if (tokenType === 'Bearer' && tokenValue) {
                    const verify = jwt.verify(tokenValue, this.secretKey);

                    if (!verify) {
                        throw new UnauthorizedException('인증이 유효하지 않습니다. ');
                    } else {
                        //next()
                        const userId = verify.sub;
                        const findUser = await this.userService.findByUserIdGetUserName(+userId);
                        const handshakAuthUser = (context.switchToWs().getClient().handshake.auth.user = findUser); //TypeError: Cannot create property 'user' on string 'first';
                        Logger.log(`handshakAuthUser: ${handshakAuthUser}`);

                        return true;
                    }
                } else {
                    throw new UnauthorizedException('인증이 유효하지 않습니다.');
                }
            };
            return await verifyToken(token);
        } catch (err) {
            console.log('___에러에러');

            throw new WsException('로그인이 필요합니다.');
        }
    }
}
