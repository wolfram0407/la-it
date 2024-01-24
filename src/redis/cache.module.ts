////import { CacheModule } from '@nestjs/cache-manager';
//import { Module } from '@nestjs/common';
//import { CacheModule as CacheMdl } from '@nestjs/cache-manager';
//import type { RedisClientOptions } from 'redis';
//import { ConfigService } from '@nestjs/config';
//const redisStore = require('cache-manager-redis-store').redisStore;
//import { createClient } from 'redis';

////@Global()
//@Module({
//    imports: [
//        CacheMdl.register<RedisClientOptions>({
//            //레디스 서버에 연결.
//            store: redisStore,
//            useFactory: async (configService: ConfigService) => {
//              const client = createClient({
//                  password: configService.get<string>('REDIS_PASSWORD'),
//                  host: configService.get<string>('REDIS_HOST'),
//                  port: configService.get<number>('REDIS_PORT'),
//              });
//              await client.connect();
//              return client;
//          },
//            //url: 'redis://:8mxniN7zKdW6bDp2zQOkiQb1s33zYjjq@redis-15680.c294.ap-northeast-1-2.ec2.cloud.redislabs.com:15680:6379',
//            //ttl: 600, // 시간(초) 동안 데이터를 캐시에 저장
//        }), // 다른 모듈
//    ],
//    // controllers, providers 등
//})
//function createClient(arg0: { password: string; host: string; port: number; }) {
//  throw new Error('Function not implemented.');
//}

//import { Module } from '@nestjs/common';
//import * as redisStore from 'cache-manager-redis-store';
//import { ConfigModule, ConfigService } from '@nestjs/config';
//import { CacheModule } from '@nestjs/cache-manager';
//import { RedisConfigService } from './redis.config.service';
////import { RedisConfigService } from '..redis/redis.config.service'; // 여기서 정의한 서비스

//@Module({
//    imports: [
//        CacheModule.registerAsync({
//            imports: [ConfigModule],
//            inject: [ConfigService],
//            useClass: RedisConfigService,
//            //useFactory: async (configService: ConfigService) => ({
//            //    store: redisStore,
//            //    host: configService.get('REDIS_HOST'),
//            //    port: configService.get('REDIS_PORT'),
//            //    // 여기에 필요한 다른 Redis 설정 추가
//            //}),
//        }),
//        // 다른 모듈들
//    ],
//    // controllers, providers 등
//})
//export class AppModule {}

//];
