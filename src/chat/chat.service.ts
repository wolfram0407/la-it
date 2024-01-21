import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateChatDto } from './dto/chat.dto';
import { UpdateChatDto } from './dto/response.chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Chat } from './schema/chat.schema';
import { Model } from 'mongoose';
import { Like } from 'typeorm';
import { Socket } from 'socket.io';

@Injectable()
export class ChatService {
    constructor(@InjectModel(Chat.name) private readonly ChatModel: Model<Chat>) {}

    //임시 메모리 저장소.
    private readonly chatData: { [key: number]: any } = {};

    async enterLiveRoomChat(liveId: string, socket: Socket) {
        try {
            console.log('방에 들어옴');
            const joinTheChatRoom = socket.join(liveId);
            console.log('결과', joinTheChatRoom);
        } catch (err) {
            throw new InternalServerErrorException('알 수 없는 이유로 요청에 실패했습니다.');
        }
    }

    async createChat(socket: Socket, value: string, liveId: string) {
        try {
            const saveChat = new this.ChatModel({ userId: 1, liveId, content: value });
            return saveChat.save();
        } catch (err) {
            throw new InternalServerErrorException('알 수 없는 이유로 요청에 실패했습니다.');
            //throw new WsException('Invalid credentials.');
        }
    }

    async getAllChatByLiveId(liveId: string) {
        try {
            const chats = await this.ChatModel.find({ where: { liveId }, select: [] });
            console.log('가져온채팅', chats);
            return chats;
        } catch (err) {
            throw new InternalServerErrorException('알 수 없는 이유로 요청에 실패했습니다.');
        }
    }

    async getSearchChatMessage(searchValue: string, liveId: string) {
        try {
            const searchMessage = await this.ChatModel.findOne({ where: { liveId, content: Like(`%{searchValue}%`) } });
            return searchMessage;
        } catch (err) {
            throw new InternalServerErrorException('알 수 없는 이유로 요청에 실패했습니다.');
        }
    }

    async getSearchChatNickname() {
        try {
        } catch (err) {
            throw new InternalServerErrorException('알 수 없는 이유로 요청에 실패했습니다.');
        }
    }
}
