import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { IoAdapter } from '@nestjs/platform-socket.io';

import cookieParser from 'cookie-parser';
import { WinstonLogger, WinstonModule, utilities } from 'nest-winston';
import * as winston from 'winston';
import { SentryInterceptor } from './common/interceptor/sentry.interceptor';

import * as Sentry from "@sentry/node"
import { ConfigService } from '@nestjs/config';
async function bootstrap()
{
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: WinstonModule.createLogger({
            transports: [
                new winston.transports.Console({
                    level: 'info',
                    format: winston.format.combine(winston.format.timestamp(), utilities.format.nestLike('La-it', { prettyPrint: true })),
                }),
            ],
        }),
    });
    const configService = app.get(ConfigService);
    const corsOptions: CorsOptions = {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    };
    app.enableCors(corsOptions);
    app.use(cookieParser());
    //소켓 어뎁터로 연결(nest에서 웹소켓을 사용할 수 있도록)
    app.useWebSocketAdapter(new IoAdapter(app));

    const config = new DocumentBuilder().setTitle('NestJS project').setDescription('').setVersion('1.0').addBearerAuth().build();
    const customOptions: SwaggerCustomOptions = {
        swaggerOptions: {
            persistAuthorization: true,
        },
    };

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, customOptions);

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
        }),
    );

    app.useStaticAssets(join(__dirname, '../..', 'public'));
    app.setBaseViewsDir(join(__dirname, '../..', 'views'));
    app.setViewEngine('ejs');

    app.enableCors();
    Sentry.init({ dsn: configService.get('SENTRY_DSN') })
    app.useGlobalInterceptors(new SentryInterceptor)
    await app.listen(3002);
    Logger.log(`listening on ${3002}`);
}
bootstrap();
