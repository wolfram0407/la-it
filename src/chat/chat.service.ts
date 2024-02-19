import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chat } from './schema/chat.schema';
import { Model } from 'mongoose';
import { Server, Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';
import { RedisClientType } from 'redis';
import { DataSource, Like } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { LiveService } from 'src/live/live.service';

@Injectable()
export class ChatService {
    private timeOutIsRunning = false;
    private timeOut: NodeJS.Timeout | null = null;
    private setIntervalFunc;
    private intervalDataPush;
    private createChatRoomNoChatData;
    private server: Server;
    private socket: Socket;

    constructor(
        @InjectModel(Chat.name) private readonly ChatModel: Model<Chat>,
        private readonly userService: UserService,
        private readonly liveService: LiveService,
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
            Logger.log(err);
        }
    }

    async deleteChatRoom(channelId: string, socket: Socket) {
        try {
            clearInterval(this.setIntervalFunc);
            return;
        } catch (err) {
            Logger.log(err);
        }
    }
    async enterLiveRoomChat(channelId: string, socket: Socket) {
        try {
            const joinTheChatRoom = socket.join(channelId);

            const getChannelChatCacheData = await this.redis.XRANGE(channelId, '-', '+');
            const getChannelChatCacheDataRecent = getChannelChatCacheData.slice(-30);
            return getChannelChatCacheDataRecent;
        } catch (err) {
            throw new InternalServerErrorException('알 수 없는 이유로 요청에 실패했습니다.');
        }
    }

    async deleteBlockUser(channelId: string) {
        try {
            await this.redis.hDel('blockUser', `${channelId}`);
            return;
        } catch (err) {
            Logger.log(err);
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
            Logger.log(err);
        }
    }

    async dataPushMongo(channelId: string) {
        try {
            if (this.createChatRoomNoChatData === true) return;
            const channelIdDataSize = await this.redis.xLen(channelId);
            const channelIdDataSizeHalf = Math.floor(channelIdDataSize / 2);
            //캐시에 반절만 가져오기
            const moveDataToCache = await this.liveChatDataMoveMongo(channelId, channelIdDataSizeHalf);
            Logger.log('몽고디비에 데이터 넣었슈', moveDataToCache);

            return moveDataToCache;
        } catch (err) {
            Logger.log(err);
        }
    }

    //캐시 저장.
    async setStreamCache(channelId: string, cacheData: object) {
        await this.redis.xAdd(channelId, '*', { ...cacheData });
        Logger.log('레디스에 데이터 넣었슈');
        const channelIdDataSize = await this.redis.xLen(channelId);

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
            const filterRedisData = recentRedisChatData.filter((data) => {
                if (+data.message.userId === userId && data.message.content === content.trim()) {
                    return data;
                }
            });

            if (filterRedisData.length) {
                const cacheDataTime = recentRedisChatData[recentRedisChatData.length - 1].id.split('-')[0];
                const dataTime = new Date(+cacheDataTime);
                const currentTime = new Date();

                if (+currentTime - +dataTime < 1000) {
                    return 'toFastChat';
                }

                if (filterRedisData.length >= 2) {
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

            return userId.toString();
        } catch (err) {
            Logger.log('err', err);
            throw new InternalServerErrorException('알 수 없는 이유로 요청에 실패했습니다.');
        }
    }

    //socket 객체 저장
    public setServer(server: Server) {
        this.server = server;
    }

    //실시간 방송 시청자수
    @Cron('*/5  * * * * *')
    async roomUserCtn() {
        const roomsMapObj = this.server.sockets.adapter.rooms;
        const isExistLiveStream = await this.liveService.findOnlyLiveGoing();
        if (isExistLiveStream.length < 1) return;
        const watchCtn = {};
        for (let [k, e] of roomsMapObj) {
            if (k.length > 30) {
                const channelIdExists = await this.userService.FindChannelIdByChannel(k);
                channelIdExists ? (watchCtn[k] = +e.size - 1) : watchCtn;
            }
        }
        return watchCtn;
    }

    async getAllChatByChannelId(channelId: string) {
        try {
            const chats = await this.ChatModel.find({ channelId }).select('userId nickname channelId content createdAt');
            return chats;
        } catch (err) {
            throw new InternalServerErrorException('알 수 없는 이유로 요청에 실패했습니다.');
        }
    }

    async getSearchChatMessage(searchValue: string, channelId: string) {
        try {
            const searchMessage = await this.ChatModel.findOne({ where: { channelId, content: Like(`%{searchValue}%`) } });
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
