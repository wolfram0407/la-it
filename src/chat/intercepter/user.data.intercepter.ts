//import { CallHandler, CanActivate, ExecutionContext, Injectable, NestInterceptor, UnauthorizedException } from '@nestjs/common';
//import { UserService } from 'src/user/user.service';
//import * as jwt from 'jsonwebtoken';
//import { ConfigService } from '@nestjs/config';
//import { Socket } from 'socket.io';
//import { find } from 'lodash';
//import { Observable } from 'rxjs';

//@Injectable()
//export class WsUserInfo implements NestInterceptor {
//    constructor(
//        private userService: UserService,
//        private readonly configService: ConfigService,
//    ) {}
//    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
//        r
//    }
//    private readonly secretKey = this.configService.get<string>('JWT_SECRET_KEY');

//    canActivate(context: ExecutionContext): any {
//        const token = context.switchToWs().getClient().handshake.headers.cookie.split('=')[1];
//        console.log('token', token, context.switchToWs().getClient().handshake.headers);

//        try {
//            const verifyToken = async (token: string): Promise<any> => {
//                const verify = jwt.verify(token, process.env.JWT_SECRET_KEY);
//                console.log('verify', verify, typeof verify.sub);
//                const userId = verify.sub;
//                if (!verify) {
//                    throw new UnauthorizedException('인증이 유효하지 않습니다. ');
//                } else {
//                    //next()
//                    const findUser = await this.userService.findByKakaoIdGetUserName(+userId);
//                    console.log('findUser', findUser); //findUser User { nickname: '유은지' }
//                    return (context.switchToWs().getClient().handshake.auth = findUser); //TypeError: Cannot create property 'user' on string 'first'
//                }
//            };
//            verifyToken(token);
//        } catch (err) {}
//    }
//}
