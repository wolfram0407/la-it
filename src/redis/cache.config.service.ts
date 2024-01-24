import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

export const redisProvider = [
    {
        imports: [ConfigModule],
        inject: [ConfigService],
        provide: 'REDIS_CLIENT',
        useFactory: async (configService: ConfigService) => {
            const client = createClient({
                password: configService.get<string>('REDIS_PASSWORD'), //테스트
                socket: {
                    host: configService.get<string>('REDIS_HOST'),
                    port: configService.get<number>('REDIS_PORT'),
                },
            });
            await client.connect();

            const connectCheck = await client.ping();
            if (connectCheck === 'PONG') console.log('REDIS Connect!');

            return client;
        },
    },
];
