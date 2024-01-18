import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger'
import { Logger, ValidationPipe } from '@nestjs/common';
import { WinstonModule, utilities } from 'nest-winston';
import winston from 'winston';

import DailyRotateFile from 'winston-daily-rotate-file';
import path from "path";



async function bootstrap()
{

  const logDirectory = path.join(__dirname, '../../src/common/log');

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          level: 'debug',
          format: winston.format.combine(
            winston.format.timestamp(),
            utilities.format.nestLike('La-iT', { prettyPrint: true }),
          )
        }),
        new DailyRotateFile({
          level: 'info',
          filename: 'application-%DATE%.log',
          dirname: path.join(logDirectory),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          format: winston.format.combine(
            winston.format.timestamp(),
            utilities.format.nestLike('La-iT', { prettyPrint: true }),
          )
        })
      ]
    }),

  });


  app.setGlobalPrefix('/api');
  const config = new DocumentBuilder()
    .setTitle('NestJS project')
    .setDescription('')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
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
  const port = 3002
  await app.listen(port);
  Logger.log(`listening on ${port}`);
}
bootstrap();
