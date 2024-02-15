import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
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
import { Client } from 'socket.io/dist/client';

@Injectable()
export class ChatService {
    private timeOutIsRunning = false;
    private timeOut: NodeJS.Timeout | null = null;
    private setIntervalFunc;
    private intervalDataPush;
    private createChatRoomNoChatData;

    constructor(
        @InjectModel(Chat.name) private readonly ChatModel: Model<Chat>,
        private readonly userService: UserService,
        //@Inject(CACHE_MANAGER) private cacheManager: Cache, // 캐시 매니저 인스턴스 주입
        @Inject('REDIS_CLIENT') private readonly redis: RedisClientType,
        private dataSource: DataSource,
    ) {}

    async createChatRoom(channelId: string, socket: Socket) {
        try {
            const joinTheChatRoom = socket.join(channelId);
            this.createChatRoomNoChatData = true;

            this.setIntervalFunc = setInterval(async () => {
                Logger.log('룸이 생성된 이후 1분마다 몽고디비에 데이터 보낼 준비를 합니다.');
                await this.dataPushMongo(channelId);
            }, 60000); //1분
            return joinTheChatRoom;
        } catch (err) {
            // console.log(err);
        }
    }

    async deleteChatRoom(channelId: string, socket: Socket) {
        try {
            clearInterval(this.setIntervalFunc);
            return;
        } catch (err) {
            // console.log(err);
        }
    }
    async enterLiveRoomChat(channelId: string, socket: Socket) {
        try {
            const joinTheChatRoom = socket.join(channelId);

            const getChannelChatCacheData = await this.redis.xRange(channelId, '-', '+');

            return getChannelChatCacheData;
        } catch (err) {
            throw new InternalServerErrorException('알 수 없는 이유로 요청에 실패했습니다.');
        }
    }

    async liveChatDataMoveMongo(channelId: string, countNum: number) {
        try {
            let getRedisChatData;
            if (countNum > 0) {
                getRedisChatData = await this.redis.xRange(channelId, '-', '+', { COUNT: countNum });
                if (getRedisChatData.length < 100) return false; //100 으로 변경예정
            } else {
                getRedisChatData = await this.redis.xRange(channelId, '-', '+');
            }

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

            if (countNum > 0) {
                Logger.log('레디스에 채팅내역 반절 삭제중');
                await this.redis.xDel(channelId, [...onlyIdGetRedisChatData]);
                return;
            } else {
                Logger.log('레디스에 채팅내역 해당 채널내용 다 삭제중');
                await this.redis.del(channelId);
                return;
            }
        } catch (err) {
            // console.log(err);
        }
    }

    async dataPushMongo(channelId: string) {
        try {
            if (this.createChatRoomNoChatData === true) return;
            const channelIdDataSize = await this.redis.xLen(channelId);
            const channelIdDataSizeHalf = Math.floor(channelIdDataSize / 2);
            // console.log('1분 주기로 실행중', channelIdDataSize, channelIdDataSizeHalf);
            //캐시에 반절만 가져오기
            const moveDataToCache = await this.liveChatDataMoveMongo(channelId, channelIdDataSizeHalf);
            Logger.log('몽고디비에 데이터 넣었슈', moveDataToCache);

            return moveDataToCache;
        } catch (err) {
            // console.log(err);
        }
    }

    //캐시 저장.
    async setStreamCache(channelId: string, cacheData: object) {
        await this.redis.xAdd(channelId, '*', { ...cacheData });
        Logger.log('레디스에 데이터 넣었슈');
        const channelIdDataSize = await this.redis.xLen(channelId);

        //console.log('channelIdDataSize 길이캐쉬', channelIdDataSize);

        if (channelIdDataSize >= 200) {
            //100으로 변경예정
            this.dataPushMongo(channelId);
            return true;
        }

        if (!this.timeOutIsRunning) return false;
        return false;
    }

    //채팅
    async createChat(socket: Socket, content: string, channelId: string, userId: number, nickname: string): Promise<string> {
        try {
            this.createChatRoomNoChatData = false;
            //도배확인
            const getRedisChatData = await this.redis.XRANGE(channelId, '-', '+');
            const recentRedisChatData = getRedisChatData.slice(-5);
            Logger.log('위에서부터 5개 데이터만 가져와유 ', recentRedisChatData);
            // console.log('위에서부터 5개 데이터만 가져와유 recentRedisChatData', recentRedisChatData);
            const filterRedisData = recentRedisChatData.filter((data) => {
                if (+data.message.userId === userId && data.message.content === content.trim()) {
                    return data;
                }
            });
            Logger.log('동일유저 동일메세지 인건지_ 필터레디스데이타 길이 ', filterRedisData.length);

            if (filterRedisData.length) {
                const cacheDataTime = recentRedisChatData[recentRedisChatData.length - 1].id.split('-')[0];
                const dataTime = new Date(+cacheDataTime);
                const currentTime = new Date();
                Logger.log('현재시간', currentTime);
                Logger.log('이전 데이터 ', currentTime);
                Logger.log('시간차이', +currentTime - +dataTime);

                if (+currentTime - +dataTime < 1000) {
                    Logger.log('너무 빨라유 1초안에  많은걸 하려고 하지 마세요');
                    return 'toFastChat';
                }

                if (filterRedisData.length >= 2) {
                    Logger.log('도배 금지! 동일한 내용을 좀전에 입력했어요');
                    return 'sameChat';
                }
            }

            const cacheData = {
                userId: userId.toString(),
                nickname: nickname,
                channelId: channelId,
                content: content,
            };
            const moveDataToMongo = await this.setStreamCache(channelId, cacheData);

            if (!moveDataToMongo) {
                // console.log('데이터를 레디스에만 넣고 db로 아직 안옮김');
            } else console.log('데이터를 레디스에 넣고 db로 옮김');

            //2개의 채널이 동시에 작동하는 경우 테스트 해볼것.

            return '성공';
        } catch (err) {
            // console.log('err', err);
            throw new InternalServerErrorException('알 수 없는 이유로 요청에 실패했습니다.');
            //throw new WsException('Invalid credentials.');
        }
    }

    async getAllChatByChannelId(channelId: string) {
        try {
            // console.log(channelId);
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
