import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { RedisClientType } from 'redis';

import { ChatService } from './chat.service';
import { Inject, Logger, UseGuards } from '@nestjs/common';
import { EnterRoomSuccessDto } from './types/res.types';
import { WsGuard } from 'src/auth/guards/chat.guard';
import { searchProhibitedWords } from './forbidden.words';
import { LiveService } from 'src/live/live.service';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({
    cors: {
        origin: ['https://la-it.online/', 'https://streaming.la-it.online/'],
        credentials: true,
    },
})
export class ChatGateway {
    @WebSocketServer() server: Server;
    private interval;
    private whileRepeat;
    constructor(
        private readonly chatService: ChatService,
        @Inject(LiveService)
        private readonly liveService: LiveService,
        @Inject('REDIS_CLIENT')
        private readonly redis: RedisClientType,
        private readonly configService: ConfigService,
    ) {}
    private readonly secretKey = this.configService.get<string>('JWT_SECRET_KEY');

    @UseGuards(WsGuard)
    @SubscribeMessage('create_room')
    async createLiveRoomChat(client: Socket, channelId: string): Promise<any> {
        const createChatRoom = await this.chatService.createChatRoom(channelId, client);
        Logger.log(`채팅방이 생성되었어요.${client.id}`);
        return createChatRoom;
    }

    @UseGuards(WsGuard)
    @SubscribeMessage('stop_live')
    async deleteChatRoom(client: Socket, channelId: string) {
        const deleteChatRoom = await this.chatService.deleteChatRoom(channelId, client);
        this.whileRepeat = false;
        clearInterval(this.interval);
        const obj = {};
        obj[channelId] = 0;
        await this.redis.hDel('watchCtn', channelId);
        return 'intervalEnd';
    }

    @SubscribeMessage('enter_room')
    async enterLiveRoomChat(client: Socket, channelId: string): Promise<EnterRoomSuccessDto> {
        Logger.log(`++++++++++++++++++엔터룸 ${channelId}+++++++++`);

        const token = client.handshake.auth?.token;
        let userId;
        if (token !== 'undefined') {
            const tokenValue = token?.split(' ')[1];
            const verify = jwt.verify(tokenValue, this.secretKey);
            userId = verify.sub;
        }

        const chats = await this.chatService.enterLiveRoomChat(channelId, client);

        for (let i = 0; i < chats.length; i++) {
            Logger.log('enter_room 함수 안에서 반복문이에요~~');
            this.server.to(client.id).emit('sending_message', chats[i].message.content, chats[i].message.nickname, chats[i].message.userId);
        }

        return {
            statusCode: 200,
            message: '채팅방 입장 성공',
            data: chats,
        };
    }

    @SubscribeMessage('exit_room')
    async exitLiveRoomChat(client: Socket, channelId: string): Promise<any> {
        Logger.log(`exit_room 이 실행되고 있습니다.`);
        const deleteBlockUser = await this.chatService.deleteBlockUser(channelId);
        const moveChatData = await this.chatService.liveChatDataMoveMongo(channelId, 0);
        const endLive = await this.liveService.end(channelId);

        if (endLive) {
            return this.server.to(channelId).emit('bye');
        }
    }

    @UseGuards(WsGuard)
    @SubscribeMessage('new_message')
    async createChat(client: Socket, [value, channelId]: [value: string, channelId: string]) {
        const { userId, nickname } = client.handshake.auth.user;
        const url = client.handshake.headers.referer.split('/');
        const userUrlStreamOrChannel = url[url.length - 2];

        const getRedisBlockUser = await this.redis.hGet('blockUser', `${channelId}`);
        const isBlockUser = getRedisBlockUser?.includes(userId);
        let saveChat;

        if (isBlockUser) {
            this.server.to(client.id).emit('alert', '스트리머가 당신을 차단했습니다.');
            return;
        }

        const filterWord = await searchProhibitedWords(value);
        let result = true;
        if (filterWord) {
            this.server.to(client.id).emit('alert', '허용하지 않는 단어입니다.'); //소켓 서버 끊겨도 알러트 뜨는거 확인.
            result = false;
            return;
        }

        if (userUrlStreamOrChannel === 'streaming') {
            saveChat = await this.chatService.createChat(client, value, channelId, userId, '스트리머');
        } else {
            saveChat = await this.chatService.createChat(client, value, channelId, userId, nickname);
        }

        if (saveChat === 'sameChat') {
            this.server.to(client.id).emit('alert', '동일한 내용의 채팅입니다. 잠시 후 다시 시도해 주세요.');
            result = false;
            return;
        }
        if (saveChat === 'toFastChat') {
            this.server.to(client.id).emit('alert', '메세지를 전송할 수 없습니다. 메세지를 너무 빨리 보냈습니다.'); //연결 끊겨도 나오는거 확인.
            result = false;
            return;
        }
        if (result) {
            if (userUrlStreamOrChannel === 'streaming') {
                saveChat = '-1';
            }
            const sendingMessage = this.server.to(channelId).emit('sending_message', value, nickname, saveChat);
            return sendingMessage;
        }
    }

    //채팅 금지시키기
    @SubscribeMessage('block_user')
    async blockUser(client: Socket, [channelId, userId, userNickName]: [channelId: string, userId: string, userNickName: string]) {
        const getRedisBlockUser = await this.redis.hGet('blockUser', `${channelId}`);
        let saveRedisBlockUser;
        if (getRedisBlockUser) {
            saveRedisBlockUser = await this.redis.hSet('blockUser', channelId, `${getRedisBlockUser}, ${userId}`);
        } else if (!getRedisBlockUser) {
            saveRedisBlockUser = await this.redis.hSet('blockUser', channelId, `${userId}`);
        }
        this.server.to(channelId).emit('sending_message', `${userNickName} 차단!!`, '스트리머', -1);
    }
}
