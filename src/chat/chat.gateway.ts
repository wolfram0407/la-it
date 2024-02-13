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
    @SubscribeMessage('reconect')
    async reconnecting(client: Socket, attemptNumber: string) {
        //이게 작동은 할까?????
        Logger.log('reconnecting_to_server____++++_____++++client', client);
        //Logger.log('reconnecting_to_server_attemptNumber', attemptNumber);
        //Logger.log('reconnecting_to_server_channelId', channelId);
        //const { userId } = client.handshake.auth.user;
        //Logger.log('reconnecting_to_server_userId', userId);

        ////레디스에서 가져오기 메세지
        //const getRedisChatData = await this.redis.xRange(channelId, '-', '+');
        //const findUserDisconnectData = await this.redis.hGet(`socket_disconnect_userId_${userId}`, 'disconnectTime');
        //Logger.log('getRedisChatData', getRedisChatData);
        //Logger.log('findUserDisconnectData', findUserDisconnectData);

        //정보를 가져와서 뭐.. 보여주고 끝이 아니자나
        //보여주고나서 유저 채팅 원활하게 해야하자나.. 그건 어떻게 할껀데...
        //근데 유
        //레디스에서 유저 정보 가져와서  해당 유저정보에 해당하는 메세지
        //를 그려준다....
    }

    @SubscribeMessage('count_live_chat_user')
    async countLiveChatUser(client: Socket, channelId: string) {
        Logger.log('5초마다 실행되는 카운트 라이브 챗 유저 함수');
        const room = this.server.sockets.adapter.rooms.get(channelId)?.size;
        const rooms = this.server.sockets.adapter.rooms;

        let newWatchCount = [];
        const obj = {};
        const keys = Object.fromEntries(rooms);

        for (let data in keys) {
            if (data.length > 20) {
                newWatchCount.push(`${data}_${keys[data].size}`);
            }
        }

        newWatchCount.map(async (e) => {
            const arr = e.split('_');
            return (obj[arr[0]] = arr[1]);
        });
        console.log('count_live_chat_user  오비제이이', obj, newWatchCount);
        if (Object.keys(obj).length >= 1) {
            await this.redis.hSet('watchCtn', obj);
        }
    }

    @UseGuards(WsGuard)
    @SubscribeMessage('create_room')
    async createLiveRoomChat(client: Socket, channelId: string): Promise<any> {
        const createChatRoom = await this.chatService.createChatRoom(channelId, client);
        Logger.log(`채팅방이 생성되었어요.${client.id}`);

        await this.countLiveChatUser(client, channelId);
        this.whileRepeat = true;
        this.interval = setInterval(async () => {
            Logger.log('라이브 방송 참여자 수 계산하는 인터벌이 작동중입니다.');
            if (!this.whileRepeat) return;
            await this.countLiveChatUser(client, channelId);
            console.log('5초마다 라이브방송 참여유저수 계산중');
        }, 5000);

        return createChatRoom;
        return true;
    }

    @UseGuards(WsGuard)
    @SubscribeMessage('stop_live')
    async deleteChatRoom(client: Socket, channelId: string) {
        const deleteChatRoom = await this.chatService.deleteChatRoom(channelId, client);
        this.whileRepeat = false;
        clearInterval(this.interval);
        console.log('stop_live 멈춤 인터벌');
        const obj = {};
        obj[channelId] = 0;
        await this.redis.hDel('watchCtn', channelId);
        return 'intervalEnd';
    }

    @SubscribeMessage('enter_room')
    async enterLiveRoomChat(client: Socket, channelId: string): Promise<EnterRoomSuccessDto> {
        //이게 작동은 할까?????
        Logger.log('++++++++++++++++++엔터룸+++++++++');
        Logger.log('channelId', channelId);

        //userId 추출
        const token = client.handshake.auth?.token;
        let userId;
        if (token !== 'undefined') {
            const tokenValue = token?.split(' ')[1];
            const verify = jwt.verify(tokenValue, this.secretKey);
            userId = verify.sub;
        }

        const lastChatData = await this.redis.hGet(`lastChat_${channelId}`, `userId${userId}`);
        if (lastChatData) {
            const [lastChatId, lastClientIdData] = lastChatData.split('__');
            const lastClientId = lastClientIdData.split('_')[1];
            Logger.log('lastChatId, lastClientId', `${lastChatId}, ${lastClientId}`);
            console.log('lastClientId', lastClientId);

            const getAllChatData = await this.redis.xRange(channelId, '-', '+');
            console.log('getAllChatData', getAllChatData);
            Logger.log('enter_room 함수 안__레디스에서 가져온 채팅데이터 getAllChatData', getAllChatData);
            let lastChatIndex;
            const findMustShowChatData = getAllChatData.filter((data, i) => {
                if (data.id.toString() === lastChatId) {
                    lastChatIndex = i;
                }
                if (i > lastChatIndex) return data;
            });
            //console.log('findMustShowChatData', findMustShowChatData);

            //Logger.log('findIndexLastChat', lastChatIndex, findMustShowChatData);

            const userDisconnectData = await this.redis.hGet(`socket_disconnect_userId_${userId}`, 'channelId');
            console.log('유저가 연결 해제된 channelId', userDisconnectData);
            //const chats = await this.chatService.enterLiveRoomChat(channelId, client);
            userDisconnectData.split(' / ').forEach((channelId) => {
                client.join(channelId);
                //lastClientId.join(channelId); //오류남.
            });
            for (let i = 0; i < getAllChatData.length; i++) {
                Logger.log('enter_room 함수 안에서 반복문이에요~~');
                this.server.to(client.id).emit('sending_message', getAllChatData[i].message.content, getAllChatData[i].message.nickname);
            }

            return;
        }

        //유저가 다시 방에 입장하게 된다면 채팅 입력이 안되는 문제가 생긴다.
        //유저의 화면에 있는 채팅의 client id 값과, 다시 연결됬을때의 client id값이 바뀌기 때문.

        const chats = await this.chatService.enterLiveRoomChat(channelId, client);

        for (let i = 0; i < chats.length; i++) {
            Logger.log('enter_room 함수 안에서 반복문이에요~~');
            this.server.to(client.id).emit('sending_message', chats[i].message.content, chats[i].message.nickname);
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
        const filterWord = await searchProhibitedWords(value);
        console.log('clientId', client.id);
        if (filterWord) {
            return this.server.to(client.id).emit('alert', '허용하지 않는 단어입니다.');
        }

        const saveChat = await this.chatService.createChat(client, value, channelId, userId, nickname);
        console.log('saveChat', saveChat);
        //if (saveChat === 'sameChat') {
        //    console.log('같은내용임 ');
        //    return this.server.to(client.id).emit('alert', '동일한 내용의 채팅입니다. 잠시 후 다시 시도해 주세요.');
        //}
        if (saveChat === 'toFastChat') {
            console.log('빨라유 ');
            return this.server.to(client.id).emit('alert', '메세지를 전송할 수 없습니다. 메세지를 너무 빨리 보냈습니다.');
        }
        Logger.log('new_message 실행중');

        const sendingMessage = this.server.to(channelId).emit('sending_message', value, nickname);
        Logger.log('sendingMessage', sendingMessage);
        return sendingMessage;
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
