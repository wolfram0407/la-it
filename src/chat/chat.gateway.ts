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
        //origin: ['ws://localhost:3002/api/live'],
        origin: '*',
    },
})
@UseGuards(WsGuard)
export class ChatGateway {
    @WebSocketServer() server: Server;
    constructor(private readonly chatService: ChatService) {}

    @SubscribeMessage('enter_room')
    async enterLiveRoomChat(client: Socket, liveId: string): Promise<EnterRoomSuccessDto> {
        //@Param('liveId') liveId: string,
        const chat = await this.chatService.enterLiveRoomChat(liveId, client);
        return {
            statusCode: 200,
            message: '채팅방 입장 성공',
        };
    }

    @SubscribeMessage('new_message')
    async createChat(client: Socket, [value, liveId]: [value: string, liveId: string]) {
        console.log(client.handshake, 'client.id', client.id);
        const { userId, nickname } = client.handshake.auth.user;
        console.log(userId, nickname);
        const filterWord = await searchProhibitedWords(value);
        console.log('=====>', filterWord);
        if (filterWord) {
            return this.server.to(client.id).emit('alert', '허용하지 않는 단어입니다.');
        }
        const saveChat = await this.chatService.createChat(client, value, liveId, userId, nickname);
        console.log('saveChat', saveChat, client.handshake.auth.user.nickname);
        //return this.server.to(liveId).emit('sending_message', saveChat.content, nickname);
    }

    @SubscribeMessage('get_all_chat_by_liveId')
    async getAllChatByLiveId(client: Socket, liveId: string) {
        console.log('--');
        const socketId = client.id;
        const messages = await this.chatService.getAllChatByLiveId(liveId);
        console.log('messages', messages);
        return this.server.emit('receive_all_chat', messages);
    }

    @SubscribeMessage('getSearchChatMessage')
    async getSearchChatMessage(@MessageBody() searchDto: SearchDto, payload: { liveId: string }) {
        const { liveId } = payload;
        const findMessage = this.chatService.getSearchChatMessage(searchDto.searchValue, liveId);
        return this.server.emit('receiveGetSearchChatMessage', findMessage);
    }

    //수정 기능 고민중
    //@SubscribeMessage('updateChat')
    //async updateChat(@MessageBody() updateChatDto: UpdateChatDto, payload: { userId: number; liveId: string }) {
    //  const {userId, liveId} = payload;
    //  const updateChat = await this.chatService.updateChat(userId, liveId);

    //  return this.server.emit('receiveUpdateChat')
    //}
}
