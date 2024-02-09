import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { JwtModule, JwtService } from '@nestjs/jwt';
import sentryConfig from './common/config/sentry.config';

//import { RedisModule } from '@nestjs-modules/ioredis';
import { ImageModule } from './image/image.module';
import { HeartModule } from './heart/heart.module';
import { ChannelNoticeModule } from './channel-notice/channel-notice.module';
import { PaymentModule } from './payment/payment.module';
import { RedisModule } from './redis/redis.module';

@Module({
    imports: [
        ThrottlerModule.forRoot([
            {
                ttl: 60000,
                limit: 3,
            },
        ]),
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: configModuleValidationSchema,
            load: [sentryConfig],
        }),
        MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                uri: configService.get<string>('MONGO_URL'),
                // useNewUrlParser: true,
                // useUnifiedTopology: true,
            }),
        }),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                global: true,
                secret: config.get<string>('JWT_SECRET_KEY'),
                signOptions: { expiresIn: '1d' },
            }),
        }),
        ConfigModule.forRoot(),
        TypeOrmModule.forRootAsync(typeOrmModuleOptions),
        LiveModule,
        UserModule,
        AuthModule,
        MainModule,
        ChatModule,
        RedisModule,
        ImageModule,
        ChannelNoticeModule,
    ],
    controllers: [AppController],
    providers: [Logger],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('*');
    }
}
