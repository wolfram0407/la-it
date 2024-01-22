//import { CallHandler, CanActivate, ExecutionContext, Injectable, NestInterceptor, UnauthorizedException } from '@nestjs/common';
//import { UserService } from 'src/user/user.service';
//import * as jwt from 'jsonwebtoken';
//import { ConfigService } from '@nestjs/config';
//import { Socket } from 'socket.io';
//import { find } from 'lodash';
//import { Observable } from 'rxjs';

//TODO 추가기능 구현 예정
//@Injectable()
//export class WsUserInfo implements NestInterceptor {
//    constructor(
//        private userService: UserService,
//        private readonly configService: ConfigService,
//    ) {}
//    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {

//    }
//    private readonly secretKey = this.configService.get<string>('JWT_SECRET_KEY');

//    canActivate(context: ExecutionContext): any {
//        const token = context.switchToWs().getClient().handshake.headers.cookie.split('=')[1];
//        console.log('token', token, context.switchToWs().getClient().handshake.headers);
//    }
//}
