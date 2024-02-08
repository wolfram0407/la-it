import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { RedisClientType, createClient } from 'redis';

import { ChatService } from './chat.service';
import { SearchDto } from './dto/chat.dto';
import { Inject, Logger, UnprocessableEntityException, UseGuards } from '@nestjs/common';
import { EnterRoomSuccessDto } from './types/res.types';
import { WsGuard } from 'src/auth/guards/chat.guard';
import { searchProhibitedWords } from './forbidden.words';
import { LiveService } from 'src/live/live.service';

@WebSocketGateway({
    cors: {
        origin: ['https://la-it.online/', 'https://streaming.la-it.online/'],
        credentials: true,
    },
})
@UseGuards(WsGuard)
export class ChatGateway {
    @WebSocketServer() server: Server;
    private interval;
    private whileRepeat;
    constructor(
        private readonly chatService: ChatService,
        @Inject(LiveService)
        private readonly liveService: LiveService,
        @Inject('REDIS_CLIENT') private readonly redis: RedisClientType,
    ) {}

    @SubscribeMessage('count_live_chat_user')
    async countLiveChatUser(client: Socket, channelId: string) {
        const room = this.server.sockets.adapter.rooms.get(channelId)?.size;
        console.log('room', room);
        const rooms = this.server.sockets.adapter.rooms;
        console.log('rooms', rooms);

        let newWatchCount = [];
        const obj = {};
        const keys = Object.fromEntries(rooms);
        console.log('keys', keys);

        for (let data in keys) {
            console.log('data 루프', data);

            if (data.length > 20) {
                newWatchCount.push(`${data}_${keys[data].size}`);
            }
        }

        newWatchCount.map(async (e) => {
            const arr = e.split('_');
            return (obj[arr[0]] = arr[1]);
        });
        console.log('오비제이이', obj), newWatchCount;
        if (Object.keys(obj).length >= 1) {
            await this.redis.hSet('watchCtn', obj);
        }
    }

    @SubscribeMessage('create_room')
    async createLiveRoomChat(client: Socket, channelId: string): Promise<any> {
        const createChatRoom = await this.chatService.createChatRoom(channelId, client);
        Logger.log(`채팅방이 생성되었어요.${client.id}`);

        await this.countLiveChatUser(client, channelId);
        this.whileRepeat = true;
        this.interval = setInterval(async () => {
            if (!this.whileRepeat) return;
            await this.countLiveChatUser(client, channelId);
            console.log('5초마다 라이브방송 참여유저수 계산중');
        }, 5000);
        return createChatRoom;
        return true;
    }

    @SubscribeMessage('stop_live')
    async deleteChatRoom(client: Socket, channelId: string) {
        //const deleteChatRoom = await this.chatService.deleteChatRoom(channelId, client);
        console.log('멈춤2');
        this.whileRepeat = false;
        clearInterval(this.interval);
        console.log('멈춤 인터벌');
        const obj = {};
        obj[channelId] = 0;
        await this.redis.hDel('watchCtn', channelId);
        return 'intervalEnd';
    }

    @SubscribeMessage('enter_room')
    async enterLiveRoomChat(client: Socket, channelId: string): Promise<EnterRoomSuccessDto> {
        const chats = await this.chatService.enterLiveRoomChat(channelId, client);

        for (let i = 0; i < chats.length; i++) {
            this.server.to(channelId).emit('sending_message', chats[i].message.content, chats[i].message.nickname);
        }

        return {
            statusCode: 200,
            message: '채팅방 입장 성공',
            data: chats,
        };
    }

    //TODO 방송 종료하면 나가기
    @SubscribeMessage('exit_room')
    async exitLiveRoomChat(client: Socket, channelId: string): Promise<any> {
        const moveChatData = await this.chatService.liveChatDataMoveMongo(channelId, 0);
        const endLive = await this.liveService.end(channelId);

        if (endLive) {
            return this.server.to(channelId).emit('bye');
        }
    }

    @SubscribeMessage('new_message')
    async createChat(client: Socket, [value, channelId]: [value: string, channelId: string]) {
        const { userId, nickname } = client.handshake.auth.user;
        const filterWord = await searchProhibitedWords(value);

        if (filterWord) {
            return this.server.to(client.id).emit('alert', '허용하지 않는 단어입니다.');
        }

        const saveChat = await this.chatService.createChat(client, value, channelId, userId, nickname);
        console.log('saveChat', saveChat);
        if (saveChat === 'sameChat') {
            console.log('같은내용임 ');
            return this.server.to(client.id).emit('alert', '동일한 내용의 채팅입니다. 잠시 후 다시 시도해 주세요.');
        }
        if (saveChat === 'toFastChat') {
            console.log('빨라유 ');
            return this.server.to(client.id).emit('alert', '메세지를 전송할 수 없습니다. 메세지를 너무 빨리 보냈습니다.');
        }
        return this.server.to(channelId).emit('sending_message', value, nickname);
    }

    @SubscribeMessage('get_all_chat_by_channelId')
    async getAllChatByChannelId(client: Socket, channelId: string) {
        const socketId = client.id;
        const messages = await this.chatService.getAllChatByChannelId(channelId);
        return this.server.emit('receive_all_chat', messages);
    }

    @SubscribeMessage('getSearchChatMessage')
    async getSearchChatMessage(@MessageBody() searchDto: SearchDto, payload: { channelId: string }) {
        const { channelId } = payload;
        const findMessage = this.chatService.getSearchChatMessage(searchDto.searchValue, channelId);
        return this.server.emit('receiveGetSearchChatMessage', findMessage);
    }

    //수정 기능 고민중
    //@SubscribeMessage('updateChat')
    //async updateChat(@MessageBody() updateChatDto: UpdateChatDto, payload: { userId: number; channelId: string }) {
    //  const {userId, channelId} = payload;
    //  const updateChat = await this.chatService.updateChat(userId, channelId);

    //  return this.server.emit('receiveUpdateChat')
    //}
}
