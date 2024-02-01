import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { SearchDto } from './dto/chat.dto';
import { Server, Socket } from 'socket.io';
import { UnprocessableEntityException, UseGuards } from '@nestjs/common';
import { EnterRoomSuccessDto } from './types/res.types';
import { WsGuard } from 'src/auth/guards/chat.guard';
import { AhoCorasick } from 'aho-corasick';
import { searchProhibitedWords } from './forbidden.words';

@WebSocketGateway({
    cors: {
        //origin: ['ws://도메인주소적기/live'],
        origin: '*',
    },
})
@UseGuards(WsGuard)
export class ChatGateway {
    @WebSocketServer() server: Server;
    constructor(private readonly chatService: ChatService) {}

    @SubscribeMessage('enter_room')
    async enterLiveRoomChat(client: Socket, channelId: string): Promise<EnterRoomSuccessDto> {
        //TODO 유저가 들어오면 기존 채팅 50개 보여주기 추후 구현 예정.
        const chats = await this.chatService.enterLiveRoomChat(channelId, client);
        //console.log('게이트웨이', chats);
        //for (let i = 0; i < chats.length; i++) {
        //    //this.server.to(liveId).emit('sending_message', chats[content], chats[nickname]);
        //}

        return {
            statusCode: 200,
            message: '채팅방 입장 성공',
        };
    }

    //TODO 방송 종료하면 나가기
    @SubscribeMessage('exit_room')
    async exitLiveRoomChat(client: Socket, channelId: string): Promise<any> {
        return this.server.to(channelId).emit('bye');
    }

    @SubscribeMessage('new_message')
    async createChat(client: Socket, [value, channelId]: [value: string, channelId: string]) {
        const { userId, nickname } = client.handshake.auth.user;
        const filterWord = await searchProhibitedWords(value);

        if (filterWord) {
            return this.server.to(client.id).emit('alert', '허용하지 않는 단어입니다.');
        }
        const saveChat = await this.chatService.createChat(client, value, channelId, userId, nickname);
        console.log('메세지 확인', value);

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
