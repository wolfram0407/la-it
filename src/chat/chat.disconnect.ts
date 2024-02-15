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
            Logger.log(`___________________________ ${client.id}`);

            const url = client.handshake.headers.referer.split('/');
            Logger.log(`디스커넥트 함수내부  url: ${url}`);
            const channelId = url[url.length - 1];
            Logger.log(`디스커넥트 함수내부  channelId: ${channelId}`);

            const userUrlStreamOrChannel = url[url.length - 2];
            Logger.log(`디스커넥트 함수내부  userUrlStreamOrChannel: ${userUrlStreamOrChannel}`);

            let disconnectDataObj = {};
            let ttl = 600;
            const token = client.handshake.auth.token;
            if (!token || token.split(' ')[0] !== 'Bearer') return;

            Logger.log(`디스커넥트 함수내부 client.handshake.auth: ${client.handshake.auth.token}`);

            const tokenValue = token.split(' ')[1];
            const verify = jwt.verify(tokenValue, this.secretKey);
            const userId = verify.sub;
            Logger.log(`디스커넥트 함수내부 userId  확인필수: ${userId}`);

            const findUserDisconnectData = await this.redis.hGet(`socket_disconnect_userId_${userId}`, 'disconnectTime');
            const findUserDisconnectClientId = await this.redis.hGet(`socket_disconnect_userId_${userId}`, 'clientId');
            Logger.log('디스커넥트 함수내부 findUserDisconnectData', findUserDisconnectData);

            //레디스에서 채팅 데이터 가져오기.
            const findUserLastChatData = await this.redis.xRange(channelId, '-', '+');
            Logger.log('디스커넥트 함수내부  findUserLastChatData', findUserLastChatData);
            const lastChat = findUserLastChatData[findUserLastChatData.length - 1];

            // console.log('디스커넥트 함수내부  lastChat', lastChat);

            //lastChat_채널아이디_유저아이디 라는 키로 해당 채팅 데이터를 넣기.(id값만 넣으면 될꺼같음.)
            let obj = {};
            if (!lastChat) {
                obj[`userId${userId}`] = `lastChat 없음__clientId_${client.id}`;
            } else {
                obj[`userId${userId}`] = `${lastChat.id}__clientId_${client.id}`;
            }
            await this.redis.hSet(`lastChat_${channelId}`, obj);
            await this.redis.expire(`lastChat_${channelId}`, 10);
            //레디스에서 찍히는 스트림 타입의 시간은 대한민국 시간
            //소켓에서 찍히는 시간은 utc 시간
            //즉 소켓에서 찍히는 시간에 9시간 더해야함.

            //유저가 처음 연결 해제된거라면 데이터 넣기.
            if (!findUserDisconnectData) {
                disconnectDataObj['disconnectTime'] = client.handshake.issued;
                disconnectDataObj['clientId'] = client.id;
                disconnectDataObj['channelId'] = channelId;
                const saveDisconnectData = await this.redis.hSet(`socket_disconnect_userId_${userId}`, disconnectDataObj);
                const disconnectDataExpire = await this.redis.expire(`socket_disconnect_userId_${userId}`, ttl);

                Logger.log('디스커넥트 함수내부  saveDisconnectData', saveDisconnectData);
                //return this.server.to(channelId).emit('reload');
                return;
            }
            //유저의 연결 해제 정보가 있다면
            if (findUserDisconnectData) {
                const differenceInTimeValue = client.handshake.issued - +findUserDisconnectData;
                if (differenceInTimeValue < 600000) {
                    // 10분 이내라면 계속 저장.
                    disconnectDataObj['disconnectTime'] = client.handshake.issued;
                    disconnectDataObj['clientId'] = client.id;
                    disconnectDataObj['channelId'] = channelId;

                    //const channelIds = disconnectDataObj['channelId'];
                    //disconnectDataObj['channelId'] = channelIds + ' / ' + channelId;

                    const saveDisconnectData = await this.redis.hSet(`socket_disconnect_userId_${userId}`, disconnectDataObj);
                    const disconnectDataExpire = await this.redis.expire(`socket_disconnect_userId_${userId}`, ttl);
                    Logger.log('디스커넥트 함수내부  saveDisconnectData', saveDisconnectData);
                    //return this.server.to(channelId).emit('reload');
                    return;
                }
            }

            //Logger.log('10분이 넘었슈');

            ////연결이 해제되고 저장된 캐시 데이터 __ 10분 후에는 캐시 만료시키기.
            ////저장된 시간으로부터 10분 후
            //const findChannel = await this.userService.findChannelIdByUserId(+userId);
            //Logger.log(`findChannel: ${findChannel}`);

            ////스트리머가 방송 종료를 못누르고 노트북이 꺼졋을때
            //if (userUrlStreamOrChannel === 'channel') return; //시청자라면
            //if (channelId !== findChannel.channelId) return; //스트리머가 아니라면

            //if (userUrlStreamOrChannel === 'streaming') {
            //    const moveChatData = await this.chatService.liveChatDataMoveMongo(channelId, 0);
            //    const endLive = await this.liveService.end(channelId);
            //    if (endLive) this.server.to(channelId).emit('bye');

            //    const deleteChatRoom = await this.chatService.deleteChatRoom(channelId, client);
            //    return 'endLive';
            //}
        } catch (err) {
            // console.log(err);
        }
    }
}
