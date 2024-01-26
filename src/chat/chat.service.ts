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

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Chat.name) private readonly ChatModel: Model<Chat>,
        private readonly userService: UserService,
        //@Inject(CACHE_MANAGER) private cacheManager: Cache, // 캐시 매니저 인스턴스 주입
        @Inject('REDIS_CLIENT') private readonly redis: RedisClientType,
    ) {}

    async enterLiveRoomChat(channelId: string, socket: Socket) {
        try {
            const joinTheChatRoom = socket.join(channelId);
            return joinTheChatRoom;
            //const chats = await this.ChatModel.find({ channelId });
            //console.log('chats', chats);
            //return chats;
        } catch (err) {
            throw new InternalServerErrorException('알 수 없는 이유로 요청에 실패했습니다.');
        }
    }

    //캐시 저장.
    async setHashCache(hashKey: string | number, cacheData: string) {
        console.log('+++++캐시저장중', cacheData);
        const inputData = cacheData.split('_');
        console.log('inputData', inputData); //inputData [ '2', '테스트유은지', '123', '6' ]
        console.log('레디스 확인', this.redis);
        const hsetData = await this.redis.hSet(`channelId: ${inputData[3]}`, hashKey, cacheData); //데이터가 들어오는 순간 캐시 저장,
        console.log('hsetData', hsetData); //hsetData 1//추가

        //waitToSaveMongoDB = [];
        //waitToSaveMongoDB.push({ userId: +inputData[0], nickname: inputData[1], content: inputData[2], channelId: inputData[3] });
        //console.log('waitToSaveMongoDB', waitToSaveMongoDB);

        const channelIdDataSize = await this.redis.hLen(`channelId: ${inputData[3]}`);
        console.log('channelIdDataSize 길이캐쉬', channelIdDataSize);

        if (channelIdDataSize > 20) {
            return true;
        } else {
            return false;
        }
        //return waitToSaveMongoDB;

        //const getAllCacheByKey = await this.redis.hGetAll(key);// key에 해당한느 모든 데이터 가져오기
        //const getCacheByHashKey = await this.redis.hGet(inputData.channelId, '1706086717934'); //필드에 해당하는 모든 값 가져오기

        //return getCacheByHashKey;
    }

    //채팅
    async createChat(socket: Socket, content: string, channelId: string, userId: number, nickname: string) {
        try {
            const cacheData = `${userId}_${nickname}_${content}_${channelId}`;
            console.log('cacheData', cacheData);
            const saveChatInCache = await this.setHashCache(Date.now(), cacheData);

            console.log('saveChatInCache', saveChatInCache);

            if (!saveChatInCache) {
                //console.log('어딘가 알수없는 캐시디비에 저장.');
                //const findCacheData = await this.redis.hGetAll(`channelId: ${channelId}`);
                //console.log('다뽑음321', findCacheData);

                return;
            }
            if (saveChatInCache) {
                console.log('다뽑음1');

                const findCacheData = await this.redis.hGetAll(`channelId: ${channelId}`);
                console.log('다뽑음', findCacheData);
                for (let eachData in findCacheData) {
                    console.log('eachData', eachData, findCacheData[eachData]);
                    const getDataArr = findCacheData[eachData].split('_');
                    console.log('getDataArr', getDataArr);

                    const saveChat = new this.ChatModel({
                        userId: +getDataArr[0],
                        nickname: getDataArr[1],
                        channelId: getDataArr[3],
                        content: getDataArr[2],
                    });
                    saveChat.save();
                }
                //캐시에서 해당 데이터들 지우기
                const deleteCacheData = await this.redis.del(`channelId: ${channelId}`);

                //TODO
                //이미 몽고db에 저장되었다면, 다시 저장 안되도록 하기
                //const checkMongoDBSave = new this.ChatModel.findOne({ where: { channelId: `channelId :${channelId}`, content: getDataArr[2] } });
            }

            return;
        } catch (err) {
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
