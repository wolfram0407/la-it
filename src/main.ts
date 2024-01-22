import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.setGlobalPrefix('/api');
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

    await app.listen(3002);
}
bootstrap();
