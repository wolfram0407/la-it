import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { Chat, ChatSchema } from './schema/chat.schema';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
    imports: [MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]), UserModule, AuthModule, RedisModule],
    controllers: [],
    providers: [ChatService, ChatGateway],
})
export class ChatModule {}
