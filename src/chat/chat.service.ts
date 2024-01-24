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

    async enterLiveRoomChat(liveId: string, socket: Socket) {
        try {
            const joinTheChatRoom = socket.join(liveId);
        } catch (err) {
            throw new InternalServerErrorException('알 수 없는 이유로 요청에 실패했습니다.');
        }
    }

    //캐시 저장.
    async setHashCache(hashKey: string | number, cacheData: string, waitToSaveMongoDB: object[]) {
        console.log('+++++캐시저장중', cacheData);
        const inputData = cacheData.split('_');
        console.log('inputData', inputData);
        const hsetData = await this.redis.hSet(`liveId: ${inputData[3]}`, hashKey, cacheData); //데이터가 들어오는 순간 캐시 저장,
        console.log('hsetData', hsetData);

        //waitToSaveMongoDB = [];
        //waitToSaveMongoDB.push({ userId: +inputData[0], nickname: inputData[1], content: inputData[2], liveId: inputData[3] });
        //console.log('waitToSaveMongoDB', waitToSaveMongoDB);

        const liveIdDataSize = await this.redis.hLen(`liveId: ${inputData[3]}`);
        console.log('liveIdDataSize 길이캐쉬', liveIdDataSize);

        if (liveIdDataSize > 20) {
            return true;
        } else {
            return false;
        }
        //return waitToSaveMongoDB;

        //setTimeout(function moveToMongoDB() {
        //    console.log('타임아웃');
        //    //waitToSaveMongoDB.forEach(async (data) => {
        //    //    const { userId, nickname, liveId, content } = data;
        //    //    const saveChat = await new this.ChatModel({ userId, nickname, liveId, content });
        //    //    return saveChat.save();
        //    //});
        //}, 10000);

        //const getAllCacheByKey = await this.redis.hGetAll(key);// key에 해당한느 모든 데이터 가져오기
        //const getCacheByHashKey = await this.redis.hGet(inputData.liveId, '1706086717934'); //필드에 해당하는 모든 값 가져오기

        //return getCacheByHashKey;
    }

    //채팅
    async createChat(socket: Socket, content: string, liveId: string, userId: number, nickname: string, waitToSaveMongoDB: object[]) {
        try {
            const cacheData = `${userId}_${nickname}_${content}_${liveId}`;

            const saveChatInCache = await this.setHashCache(Date.now(), cacheData, waitToSaveMongoDB);

            console.log('saveChatInCache', saveChatInCache);

            if (!saveChatInCache) {
                return;
            }
            if (saveChatInCache) {
                const findCacheData = await this.redis.hGetAll(`liveId: ${liveId}`);
                for (let eachData in findCacheData) {
                    console.log('eachData', eachData, findCacheData[eachData]);
                    const getDataArr = findCacheData[eachData].split('_');
                    console.log('getDataArr', getDataArr);

                    const saveChat = new this.ChatModel({
                        userId: +getDataArr[0],
                        nickname: getDataArr[1],
                        liveId: getDataArr[3],
                        content: getDataArr[2],
                    });
                    saveChat.save();
                }
                //캐시에서 해당 데이터들 지우기
                const deleteCacheData = await this.redis.del(`liveId: ${liveId}`);

                //이미 몽고db에 저장되었다면, 다시 저장 안되도록 하기
                //const checkMongoDBSave = new this.ChatModel.findOne({ where: { liveId: `liveId :${liveId}`, content: getDataArr[2] } });

                console.log('findCacheData', typeof findCacheData, findCacheData);
            }

            //waitToSaveMongoDB.push({ userId, nickname, liveId, content });
            //console.log('waitToSaveMongoDB', waitToSaveMongoDB);

            //setTimeout(function moveToMongoDB() {
            //    console.log('타임아웃');
            //    //waitToSaveMongoDB.forEach(async (data) => {
            //    //    const { userId, nickname, liveId, content } = data;
            //    //    const saveChat = await new this.ChatModel({ userId, nickname, liveId, content });
            //    //    return saveChat.save();
            //    //});
            //}, 10000);
            console.log('saveChatInCache', saveChatInCache);
            //console.log('길이', saveChatInCache.length);
            //const saveChat = new this.ChatModel({ userId, nickname, liveId, content });
            //return saveChat.save();
        } catch (err) {
            throw new InternalServerErrorException('알 수 없는 이유로 요청에 실패했습니다.');
            //throw new WsException('Invalid credentials.');
        }
    }

    async getAllChatByLiveId(liveId: string) {
        try {
            console.log(liveId);
            //const chats = await this.ChatModel.find({ liveId }).select('userId nickname liveId content createdAt');
            //console.log('chats', chats);
            //return chats;
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
