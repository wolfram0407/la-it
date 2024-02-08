import { Inject, Logger, UseGuards } from '@nestjs/common';
import { WebSocketGateway, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsGuard } from 'src/auth/guards/chat.guard';
import { LiveService } from 'src/live/live.service';
import { ChatService } from './chat.service';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

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
    ) {}
    private readonly secretKey = this.configService.get<string>('JWT_SECRET_KEY');

    async handleDisconnect(client: Socket) {
        try {
            Logger.log(`Client disconnected: ${client.id}`);
            Logger.log(`client.handshake: ${client.handshake}`);
            Logger.log(`client.handshake.auth: ${client.handshake.auth}`);
            Logger.log(`client.handshake.auth.user: ${client.handshake.auth.user}`);
            Logger.log(`client.handshake.auth.user.userId: ${client.handshake.auth.user.userId}`);

            Logger.log(`client.handshake.auth: ${client.handshake.auth.token}`);
            //Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInRva2VuIjoiQWNjZXNzIiwiaWF0IjoxNzA3MzcyMDM2LCJleHAiOjE3MDc0NTg0MzZ9.snI3HtHji2XNUysj2xd4w3eputT6SONAs4n_xe0GYUM

            const token = client.handshake.auth.token;
            const tokenValue = token.split(' ')[1];
            const verify = jwt.verify(tokenValue, this.secretKey);
            const userId1 = verify.sub;
            Logger.log(`userId1: ${userId1}`);

            const userId = client.handshake.auth.user.userId;
            const findChannel = await this.userService.findChannelIdByUserId(userId);
            const url = client.handshake.headers.referer.split('/');
            const channelId = url[url.length - 1];

            if (+channelId !== findChannel.channelId) {
                console.log('스트리머가 아닌 유저가 페이지 나가면 방송은 계속 진행됩니다.');
                return;
            }

            const moveChatData = await this.chatService.liveChatDataMoveMongo(channelId, 0);
            //const endLive = await this.liveService.end(+channelId);

            //if (endLive) {
            this.server.to(channelId).emit('bye');
            //}

            const deleteChatRoom = await this.chatService.deleteChatRoom(channelId, client);
            return 'endLive';
        } catch (err) {
            console.log(err);
        }
    }
}
