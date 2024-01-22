import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { SearchDto } from './dto/chat.dto';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { EnterRoomSuccessDto } from './types/res.types';
import { WsGuard } from 'src/auth/guards/chat.guard';

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
        console.log('wwuiweo');
        const saveChat = await this.chatService.createChat(client, value, liveId);
        console.log('saveChat', saveChat, client.handshake.auth.user.nickname);
        this.server.to(liveId).emit('sending_message', saveChat.content, client.handshake.auth.user.nickname);
    }

    @SubscribeMessage('get_all_chat_by_liveId')
    async getAllChatByLiveId(client: Socket, liveId: string) {
        const socketId = client.id;
        const messages = this.chatService.getAllChatByLiveId(liveId);
        return this.server.emit('receiveAllChat', messages);
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
