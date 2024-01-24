import { ServeStaticModule } from '@nestjs/serve-static';
import { Logger, Module } from '@nestjs/common';
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

        TypeOrmModule.forRootAsync(typeOrmModuleOptions),
        LiveModule,
        UserModule,
        AuthModule,
        MainModule,
        ChatModule,
    ],
    controllers: [AppController],
    providers: [],
})
export class AppModule { }
