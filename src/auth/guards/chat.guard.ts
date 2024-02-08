import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
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
        //console.log('토큰 있낟요? ', context.switchToWs().getClient().handshake);
        const token = context.switchToWs().getClient().handshake.auth.token;
        try {
            const verifyToken = async (token: string): Promise<any> => {
                const [tokenType, tokenValue] = token.split(' ');
                //console.log('tokenType', tokenType);
                //console.log('tokenValue', tokenValue);

                if (tokenType === 'Bearer' && tokenValue) {
                    //console.log('있따!!! ');
                    const verify = jwt.verify(tokenValue, this.secretKey);
                    
                    //console.log(verify);
                    if (!verify) {
                        throw new UnauthorizedException('인증이 유효하지 않습니다. ');
                    } else {
                        //next()
                        const userId = verify.sub;
                        const findUser = await this.userService.findByUserIdGetUserName(+userId);
                        //console.log('findUser', findUser);
                        const handshakAuthUser = (context.switchToWs().getClient().handshake.auth.user = findUser); //TypeError: Cannot create property 'user' on string 'first';
                        Logger.log(`handshakAuthUser: ${handshakAuthUser}`);

                        return true;
                    }
                } else {
                    throw new UnauthorizedException('인증이 유효하지 않습니다. ');
                }
            };
            return await verifyToken(token);
        } catch (err) {
            return false;
        }
    }
}
