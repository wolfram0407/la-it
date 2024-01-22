import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chat } from './schema/chat.schema';
import { Model } from 'mongoose';
import { Socket } from 'socket.io';

@Injectable()
export class ChatService {
    constructor(@InjectModel(Chat.name) private readonly ChatModel: Model<Chat>) {}

    async enterLiveRoomChat(liveId: string, socket: Socket) {
        try {
            const joinTheChatRoom = socket.join(liveId);
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
            return chats;
        } catch (err) {
            throw new InternalServerErrorException('알 수 없는 이유로 요청에 실패했습니다.');
        }
    }

    async getSearchChatMessage(searchValue: string, liveId: string) {
        try {
            //const searchMessage = await this.ChatModel.findOne({ where: { liveId, content: Like(`%{searchValue}%`) } });
            //return searchMessage;
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
