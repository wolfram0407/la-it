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
            Logger.log('___________________________');

            Logger.log(`클라이언트 아이디에요 확인필수: ${client.id}`);
            const url = client.handshake.headers.referer.split('/');
            Logger.log(`url: ${url}`);
            const channelId = url[url.length - 1];
            Logger.log(`channelId: ${channelId}`);

            const userUrlStreamOrChannel = url[url.length - 2];
            Logger.log(`userUrlStreamOrChannel: ${userUrlStreamOrChannel}`);

            let disconnectDataObj = {};
            let ttl = 600;
            const token = client.handshake.auth.token;
            if (!token || token.split(' ')[0] !== 'Bearer') return;

            Logger.log(`client.handshake.auth: ${client.handshake.auth.token}`);

            const tokenValue = token.split(' ')[1];
            const verify = jwt.verify(tokenValue, this.secretKey);
            const userId = verify.sub;
            Logger.log(`userId  확인필수: ${userId}`);

            const findUserDisconnectData = await this.redis.hGet(`socket_disconnect_userId_${userId}`, 'disconnectTime');
            const findUserDisconnectClientId = await this.redis.hGet(`socket_disconnect_userId_${userId}`, 'clientId');
            Logger.log('findUserDisconnectData', findUserDisconnectData);

            //유저가 처음 연결 해제된거라면 데이터 넣기.
            if (!findUserDisconnectData) {
                disconnectDataObj['disconnectTime'] = client.handshake.issued;
                disconnectDataObj['clientId'] = client.id;

                const saveDisconnectData = await this.redis.hSet(`socket_disconnect_userId_${userId}`, disconnectDataObj);
                const disconnectDataExpire = await this.redis.expire(`socket_disconnect_userId_${userId}`, ttl);

                Logger.log('saveDisconnectData', saveDisconnectData);
                return this.server.to(channelId).emit('reload');
            }
            //유저의 연결 해제 정보가 있다면
            if (findUserDisconnectData) {
                const differenceInTimeValue = client.handshake.issued - +findUserDisconnectData;
                if (differenceInTimeValue < 600000) {
                    // 10분 이내라면 계속 저장.
                    disconnectDataObj['disconnectTime'] = client.handshake.issued;
                    disconnectDataObj['clientId'] = client.id;

                    const saveDisconnectData = await this.redis.hSet(`socket_disconnect_userId_${userId}`, disconnectDataObj);
                    const disconnectDataExpire = await this.redis.expire(`socket_disconnect_userId_${userId}`, ttl);
                    Logger.log('saveDisconnectData', saveDisconnectData);
                    return this.server.to(channelId).emit('reload');
                }
            }
            Logger.log('10분이 넘었슈');

            //연결이 해제되고 저장된 캐시 데이터 __ 10분 후에는 캐시 만료시키기.
            //저장된 시간으로부터 10분 후
            const findChannel = await this.userService.findChannelIdByUserId(+userId);
            Logger.log(`findChannel: ${findChannel}`);

            if (userUrlStreamOrChannel === 'channel') return;
            if (channelId !== findChannel.channelId) return;

            const moveChatData = await this.chatService.liveChatDataMoveMongo(channelId, 0);
            //const delUserDisconnectData = await this.redis.hDel(`socket_disconnect_userId_${userId}`);
            //Logger.log(`delUserDisconnectData: ${delUserDisconnectData}`);

            const endLive = await this.liveService.end(channelId);

            if (endLive) {
                this.server.to(channelId).emit('bye');
            }

            const deleteChatRoom = await this.chatService.deleteChatRoom(channelId, client);
            return 'endLive';

            //Logger.log(`client.handshake.auth.user: ${client.handshake.auth.user}`);
            //Logger.log(`client.handshake.auth.user.userId: ${client.handshake.auth.user.userId}`);

            //const userId = client.handshake.auth.user.userId;
        } catch (err) {
            console.log(err);
        }
    }
}
