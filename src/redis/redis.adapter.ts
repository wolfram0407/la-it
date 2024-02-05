import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';

export class RedisIoAdapter extends IoAdapter {
    private adapterConstructor: ReturnType<typeof createAdapter>;

    async connectToRedis(configService: ConfigService): Promise<void> {
        const pubClient = createClient({
            password: configService.get<string>('REDIS_PASSWORD'), //테스트
            socket: {
                host: configService.get<string>('REDIS_HOST'),
                port: configService.get<number>('REDIS_PORT'),
            },
        });
        //publish 클라이언트의 복제본 생성해 구독 클라이언트 만들며 초기화
        const subClient = pubClient.duplicate();
        await Promise.all([pubClient.connect(), subClient.connect()]);

        this.adapterConstructor = createAdapter(pubClient, subClient);
    }

    //socket io서버 인스턴스 생성.
    createIOServer(port: number, options?: ServerOptions): any {
        const server = super.createIOServer(port, options);
        //생성된 서버 인스턴스에 레디스 어뎁터 적용.
        server.adapter(this.adapterConstructor);
        return server;
    }
}
