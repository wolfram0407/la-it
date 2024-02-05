import { Inject, UseGuards } from '@nestjs/common';
import { WebSocketGateway, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsGuard } from 'src/auth/guards/chat.guard';
import { LiveService } from 'src/live/live.service';
import { ChatService } from './chat.service';
import { UserService } from 'src/user/user.service';

@WebSocketGateway({
    cors: {
        //origin: ['ws://도메인주소적기/live'],
        origin: '*',
    },
})
@UseGuards(WsGuard)
export class ChatGatewayDisconnect implements OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    constructor(
        private readonly chatService: ChatService,
        @Inject(LiveService)
        private readonly liveService: LiveService,
        @Inject(UserService)
        private readonly userService: UserService,
    ) {}

    async handleDisconnect(client: Socket) {
        try {
            console.log(`Client disconnected: ${client.id}`);
            console.log(client.handshake);
            //console.log(client.handshake.auth.user.userId);
            const userId = client.handshake.auth.user.userId;
            const findChannel = await this.userService.findChannelIdByUserId(userId);
            const url = client.handshake.headers.referer.split('/');
            const channelId = url[url.length - 1];
            console.log('findChannel.channelId', findChannel.channelId);
            console.log('channelId', channelId);

            if (+channelId !== findChannel.channelId) {
                console.log('스트리머가 아닌 유저가 페이지 나가면 방송은 계속 진행됩니다.');
                return;
            }
            //스트리머가 아닌 유저가 디스커넥트 되면 그냥 리턴하도록.

            const moveChatData = await this.chatService.liveChatDataMoveMongo(channelId, 0);
            console.log('캐시데이터 비우고 몽고에 넣음');

            const endLive = await this.liveService.end(+channelId);
            console.log('endLive함수 정상 작동', endLive);

            if (endLive) {
                this.server.to(channelId).emit('bye');
            }

            const deleteChatRoom = await this.chatService.deleteChatRoom(channelId, client);
            console.log('deleteChatRoom 작동', deleteChatRoom);
            return 'endLive';
        } catch (err) {
            console.log(err);
        }
    }
}
