import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { Chat, ChatSchema } from './schema/chat.schema';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { RedisModule } from 'src/redis/redis.module';
import { LiveModule } from 'src/live/live.module';
import { LiveService } from 'src/live/live.service';
import { ChatGatewayDisconnect } from './chat.disconnect';
import { UserService } from 'src/user/user.service';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';

@Module({
    imports: [MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]), UserModule, AuthModule, RedisModule, LiveModule], //
    controllers: [],
    providers: [ChatService, ChatGateway, ChatGatewayDisconnect, JwtStrategy],
})
export class ChatModule {}
