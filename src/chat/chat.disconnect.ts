import { Inject, Logger, UseGuards } from '@nestjs/common';
import { WebSocketGateway, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsGuard } from 'src/auth/guards/chat.guard';
import { LiveService } from 'src/live/live.service';
import { ChatService } from './chat.service';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { RedisClientType } from 'redis';

@WebSocketGateway({
    cors: {
        origin: ['https://la-it.online/', 'https://streaming.la-it.online/'],
        credentials: true,
    },
})
export class ChatGatewayDisconnect implements OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    constructor(
        private readonly chatService: ChatService,
        @Inject(LiveService)
        private readonly liveService: LiveService,
        @Inject(UserService)
        private readonly userService: UserService,
        private readonly configService: ConfigService,
        @Inject('REDIS_CLIENT') private readonly redis: RedisClientType,
    ) {}
    private readonly secretKey = this.configService.get<string>('JWT_SECRET_KEY');
    async handleDisconnect(client: Socket) {
        try {
            const reason = client.disconnect; // Socket.IO 3.x 이상에서 사용 가능
            Logger.log('디스커넥트 함수내부 끊긴이유===>reason', reason);
            Logger.log(`________디스커넥트 클라이언트 아이디_______ ${client.id}`);

            const url = client.handshake.headers.referer.split('/');
            const channelId = url[url.length - 1];
            const userUrlStreamOrChannel = url[url.length - 2];

            //유저정보 가져오기
            const token = client.handshake.auth.token;
            if (!token || token.split(' ')[0] !== 'Bearer') return;
            const tokenValue = token.split(' ')[1];
            const verify = jwt.verify(tokenValue, this.secretKey);
            const userId = verify.sub;

            const findChannel = await this.userService.findChannelIdByUserId(+userId);
            Logger.log(`findChannel: ${findChannel}`);

            //스트리머가 방송 종료를 못누르고 노트북이 꺼졋을때
            if (userUrlStreamOrChannel === 'channel') return; //시청자라면
            if (channelId !== findChannel.channelId) return; //채널아이디가 db에 없다면

            if (userUrlStreamOrChannel === 'streaming') {
                //스트리머일 경우
                const deleteBlockUser = await this.chatService.deleteBlockUser(channelId);
                const moveChatData = await this.chatService.liveChatDataMoveMongo(channelId, 0);
                const endLive = await this.liveService.end(channelId);
                if (endLive) await this.server.to(channelId).emit('bye');

                const deleteChatRoom = await this.chatService.deleteChatRoom(channelId, client);
                return 'endLive';
            }
        } catch (err) {
            Logger.log(err);
        }
    }
}
