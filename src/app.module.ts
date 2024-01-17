import { ServeStaticModule } from '@nestjs/serve-static';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmModuleOptions } from 'config/database.config';
import { configModuleValidationSchema } from 'config/env-validation.config';
import { LiveModule } from './live/live.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MainModule } from './main/main.module';
import { AppController } from './app.controller';
import { join } from 'path';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: configModuleValidationSchema,
        }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '../..', 'public'),
        }),
        TypeOrmModule.forRootAsync(typeOrmModuleOptions),
        LiveModule,
        UserModule,
        AuthModule,
        MainModule,
    ],
    controllers: [AppController],
    providers: [],
})
export class AppModule {}
console.log(join(__dirname, './', 'public'));
