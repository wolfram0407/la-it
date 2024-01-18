import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmModuleOptions } from 'config/database.config';
import { configModuleValidationSchema } from 'config/env-validation.config';
import { LiveModule } from './live/live.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MainModule } from './main/main.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configModuleValidationSchema,
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    LiveModule,
    UserModule,
    AuthModule,
    MainModule,
  ],
  controllers: [],
  providers: [Logger],
})
export class AppModule implements NestModule
{
  configure(consumer: MiddlewareConsumer): void
  {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
