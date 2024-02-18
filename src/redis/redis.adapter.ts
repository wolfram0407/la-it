import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

export class RedisIoAdapter extends IoAdapter {
    private adapterConstructor: ReturnType<typeof createAdapter>;
    private serverInstance: Server;

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
        const connect = await Promise.all([pubClient.connect(), subClient.connect()]).catch((err) => Logger.log('adapter 에러 확인 로그', err));
        Logger.log('connect', connect);
        this.adapterConstructor = createAdapter(pubClient, subClient);
    }

    //socket io서버 인스턴스 생성. __이 메서드는 NestJS 프레임워크에 의해 내부적으로 호출되며, 개발자가 직접 호출할 필요는 없습니다.
    createIOServer(port: number, options?: ServerOptions): any {
        const server = super.createIOServer(port, options);
        //생성된 서버 인스턴스에 레디스 어뎁터 적용.
        server.adapter(this.adapterConstructor);
        this.serverInstance = server;

        return server;
    }

    getServerInstance(): Server {
        return this.serverInstance;
    }
}
