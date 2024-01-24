import { ServeStaticModule } from '@nestjs/serve-static';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmModuleOptions } from 'config/database.config';
import { configModuleValidationSchema } from 'config/env-validation.config';
import { LiveModule } from './live/live.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MainModule } from './main/main.module';
import { AppController } from './app.controller';
import { ChatModule } from './chat/chat.module';
import { MongooseModule } from '@nestjs/mongoose';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisClientOptions } from 'redis'; //타입지정용.
import { RedisModule } from '@nestjs-modules/ioredis';
import { ChatService } from './chat/chat.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: configModuleValidationSchema,
        }),
        MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                uri: configService.get<string>('MONGO_URL'),
                useNewUrlParser: true,
                useUnifiedTopology: true,
            }),
        }),
        //CacheModule.registerAsync({
        //    isGlobal: true,
        //    inject: [ConfigService],
        //    useFactory: async (configService: ConfigService) => {
        //        const store = await redisStore({
        //            socket: {
        //                host: configService.get('REDIS_HOST'),
        //                port: +configService.get('REDIS_PORT'),
        //            },
        //            //database: 'LaIt-free-db',
        //            //username: configService.get('REDIS_USERNAME'),
        //            //password: configService.get('REDIS_PASSWORD'),
        //        });
        //        return { store };
        //    },
        //}),
        //CacheModule.registerAsync({
        //    isGlobal: true,
        //    //imports: [ConfigModule],
        //    inject: [ConfigService],
        //    //provide: 'REDIS_CLIENT',
        //    useFactory: async (configService: ConfigService) => ({
        //        const store = await redisStore({
        //            socket: {
        //                host: config.get('REDIS_HOST'),
        //                port: +config.get('REDIS_PORT')
        //            }
        //        })
        //        //ttl: configService.get('REDIS_CACHE_TTL'),
        //        //store: (await redisStore({
        //        //    //  url: configService.get('REDIS_URL'),
        //        //    store: redisStore,
        //        //    host: configService.get('REDIS_HOST'),
        //        //    port: +configService.get('REDIS_PORT'),
        //        //    //password: configService.get('REDIS_PASSWORD'),
        //        //})) as unknown as CacheStore,
        //    }),
        //}),
        ConfigModule.forRoot(), // 환경변수를 사용하기 위한 ConfigModule
        //RedisModule.forRootAsync({
        //    imports: [ConfigModule],
        //    useFactory: (configService: ConfigService) => ({
        //        const store = await redisStore{
        //            config: {
        //                host: configService.get('REDIS_HOST'),
        //                port: configService.get('REDIS_PORT'),
        //                //password: configService.get('REDIS_PASSWORD'),
        //                // 필요한 경우 추가적인 Redis 설정 추가
        //            },
        //        }
        //        return {store}

        //    }),
        //}),
        TypeOrmModule.forRootAsync(typeOrmModuleOptions),
        LiveModule,
        UserModule,
        AuthModule,
        MainModule,
        ChatModule,
        RedisModule,
    ],
    controllers: [AppController],
    providers: [ChatService],
})
export class AppModule {}
