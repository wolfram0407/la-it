import { Module } from '@nestjs/common';
import { redisProvider } from './redis.config.service';

@Module({
    providers: [...redisProvider],
    exports: [...redisProvider],
})
export class RedisModule {}
