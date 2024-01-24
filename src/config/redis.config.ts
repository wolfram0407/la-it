//import { ConfigModule, ConfigService } from '@nestjs/config';
//import { createClient } from 'redis';

//export const redisProvider = [
//    {
//        imports: [ConfigModule],
//        inject: [ConfigService],
//        provide: 'REDIS_CLIENT',
//        useFactory: async (configService: ConfigService) => {
//            const client = createClient({
//                password: configService.get<string>('REDIS_PASSWORD'),
//                socket: {
//                    host: configService.get<string>('REDIS_HOST'),
//                    port: configService.get<number>('REDIS_PORT'),
//                },
//            });
//            await client.connect();
//            return client;
//        },
//    },
//];

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisConfigService {
    constructor(private configService: ConfigService) {}

    get host(): string {
        return this.configService.get<string>('REDIS_HOST');
    }

    get port(): number {
        return this.configService.get<number>('REDIS_PORT');
    }
    get password(): string {
        return this.configService.get<string>('REDIS_PASSWORD');
    }

    // 추가적으로 필요한 다른 설정들 (예: password, ttl 등)
}
