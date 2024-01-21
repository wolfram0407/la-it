import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateChatDto, SearchDto } from './dto/chat.dto';
import { UpdateChatDto } from './dto/response.chat.dto';
import { Server, Socket } from 'socket.io';
import { ExecutionContext, InternalServerErrorException, Param, Res, UseGuards } from '@nestjs/common';
import { response } from 'express';
import { EnterRoomSuccessDto } from './types/res.types';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
//import { UserInfo } from 'src/common/decorator/user.decorator';
import { UserAfterAuth } from 'src/auth/interfaces/after-auth';
import { WsGuard } from 'src/auth/guards/WsGuard';
import { User } from 'src/user/entities/user.entity';
import { WsUserInfo } from 'src/common/decorator/ws.userInfo.decorator';

//import { MessageService } from './chat.service';
//import { IMessage, IParticipant, IThread } from './chat.interface';
@WebSocketGateway({
    cors: {
        //origin: ['ws://localhost:3002/api/live'],
        origin: '*',
    },
}) //웹소켓 게이트웨이로 쓰겠음.
@UseGuards(WsGuard) //왜왜왜 이걸 통과 못해?
export class ChatGateway {
    @WebSocketServer() server: Server;
    constructor(private readonly chatService: ChatService) {}

    //TODO 사용자 인증 과정 ws 프로토콜 에서도 해야할까?
    //유저 정보 가져와야한다.
    //유저정보를 어떻게 가져올까?
    //1. userInfo를 통해 가져온다? ws프로토콜이라 불가? // @UseGuards와 @UserInfo와 같은 HTTP 요청과 관련된 데코레이터는 WebSocket 연결에서 직접 사용할 수 없습니다.
    //2. 토큰을 복호화 한다., 아이디를 가지고 유저정보를 조회한다.
    //2 이것으로 해야겠다. user서비스단 함수 가져와서 해야겠다.

    @SubscribeMessage('enter_room')
    async enterLiveRoomChat(client: Socket, liveId: string): Promise<EnterRoomSuccessDto> {
        //@Param('liveId') liveId: string,
        console.log('--~~~www~~~ddd---', client.handshake.auth.user);

        const chat = await this.chatService.enterLiveRoomChat(liveId, client);
        console.log('--~~~www~~~---', liveId, chat);
        return {
            statusCode: 200,
            message: '채팅방 입장 성공',
        };
    }

    @SubscribeMessage('new_message')
    async createChat(client: Socket, [value, liveId]: [value: string, liveId: string]) {
        console.log('++>>', value, liveId, client.handshake.auth.token);
        console.log('++eee>>', client.handshake.auth);

        const saveChat = await this.chatService.createChat(client, value, liveId);
        this.server.to(liveId).emit('sending_message', saveChat.content, client.handshake.auth.user.nickname);
    }

    @SubscribeMessage('get_all_chat_by_liveId')
    async getAllChatByLiveId(client: Socket, liveId: string) {
        console.log('getAllChatByLiveId', client, liveId);
        const socketId = client.id;
        console.log('socketId', socketId);
        const messages = this.chatService.getAllChatByLiveId(liveId);

        //return this.server.emit('receiveAllChat', messages);
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
