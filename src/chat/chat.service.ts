import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chat } from './schema/chat.schema';
import { Model } from 'mongoose';
import { Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RedisClientType } from 'redis';
import { object } from 'joi';
import { DataSource, MongoDBNamespace } from 'typeorm';

@Injectable()
export class ChatService {
    private timeOutIsRunning = false;
    private timeOut: NodeJS.Timeout | null = null;

    constructor(
        @InjectModel(Chat.name) private readonly ChatModel: Model<Chat>,
        private readonly userService: UserService,
        //@Inject(CACHE_MANAGER) private cacheManager: Cache, // 캐시 매니저 인스턴스 주입
        @Inject('REDIS_CLIENT') private readonly redis: RedisClientType,
        private dataSource: DataSource,
    ) {}

    async enterLiveRoomChat(channelId: string, socket: Socket) {
        try {
            const joinTheChatRoom = socket.join(channelId);
            return joinTheChatRoom;
        } catch (err) {
            throw new InternalServerErrorException('알 수 없는 이유로 요청에 실패했습니다.');
        }
    }

    async dataPushMongo(channelId) {
        try {
            const channelIdDataSize = await this.redis.xLen(channelId);
            const channelIdDataSizeHalf = Math.floor(channelIdDataSize / 2);
            console.log('5초주기로 실행중', channelIdDataSize, channelIdDataSizeHalf);
            //캐시에 반절만 가져오기
            const getRedisChatData = await this.redis.xRange(channelId, '-', '+', { COUNT: channelIdDataSizeHalf });

            if (getRedisChatData.length < 3) return false; //100 으로 변경예정

            const onlyIdGetRedisChatData = getRedisChatData.map((e) => e.id);
            const newGetRedisChatData = getRedisChatData.map((e) => {
                const createdTimeNum = e.id.toString().split('-')[0];
                const createdAt = new Date(+createdTimeNum + 32400000);
                return {
                    userId: e.message.userId,
                    nickname: e.message.nickname,
                    channelId: e.message.channelId,
                    content: e.message.content,
                    createdAt: createdAt.toISOString(),
                    updatedAt: createdAt.toISOString(),
                };
            });
            const mongoChatSave = await this.ChatModel.insertMany(newGetRedisChatData);

            await this.redis.xDel(channelId, [...onlyIdGetRedisChatData]);

            return true;
        } catch (err) {
            console.log(err);
        }
    }

    //캐시 저장.
    async setStreamCache(channelId: string, cacheData: object) {
        await this.redis.xAdd(channelId, '*', { ...cacheData });
        const channelIdDataSize = await this.redis.xLen(channelId);

        //console.log('channelIdDataSize 길이캐쉬', channelIdDataSize);

        if (channelIdDataSize >= 10) {
            //100으로 변경예정
            console.log('열개 넘음');
            this.dataPushMongo(channelId);
            return true;
        }

        setInterval(async () => {
            this.timeOutIsRunning = true;
            await this.dataPushMongo(channelId);
            this.timeOutIsRunning = false;
            return true;
        }, 5000); //10초로 변경예정
        if (!this.timeOutIsRunning) return false;
        return false;
    }

    //채팅
    async createChat(socket: Socket, content: string, channelId: string, userId: number, nickname: string): Promise<string> {
        try {
            //도배확인
            const getRedisChatData = await this.redis.xRange(channelId, '-', '+');
            const filterRedisData = getRedisChatData.filter((data) => {
                if (+data.message.userId === userId && data.message.content === content) {
                    return data;
                }
            });

            if (filterRedisData.length) {
                const cacheDataTime = filterRedisData[filterRedisData.length - 1].id.split('-')[0];
                const dataTime = new Date(+cacheDataTime);
                const currentTime = new Date();

                if (+currentTime - +dataTime < 3000) {
                    return 'toFastChat';
                }

                //if (filterRedisData.length >= 1) {
                //    return 'sameChat';
                //}
            }

            const cacheData = {
                userId: userId.toString(),
                nickname: nickname,
                channelId: channelId,
                content: content,
            };
            const moveDataToMongo = await this.setStreamCache(channelId, cacheData);

            if (!moveDataToMongo) {
                console.log('데이터를 레디스에만 넣고 db로 아직 안옮김');
            } else console.log('데이터를 레디스에 넣고 db로 옮김');

            //2개의 채널이 동시에 작동하는 경우 테스트 해볼것.

            return '성공';
        } catch (err) {
            console.log('err', err);
            throw new InternalServerErrorException('알 수 없는 이유로 요청에 실패했습니다.');
            //throw new WsException('Invalid credentials.');
        }
    }

    async getAllChatByChannelId(channelId: string) {
        try {
            console.log(channelId);
            //const chats = await this.ChatModel.find({ channelId }).select('userId nickname channelId content createdAt');
            //console.log('chats', chats);
            //return chats;
        } catch (err) {
            throw new InternalServerErrorException('알 수 없는 이유로 요청에 실패했습니다.');
        }
    }

    async getSearchChatMessage(searchValue: string, channelId: string) {
        try {
            //const searchMessage = await this.ChatModel.findOne({ where: { channelId, content: Like(`%{searchValue}%`) } });
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
