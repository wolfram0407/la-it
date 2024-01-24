import { Module } from '@nestjs/common';
import { redisProvider } from './cache.config.service';

@Module({
    providers: [...redisProvider],
    exports: [...redisProvider],
})
export class RedisModule {}
