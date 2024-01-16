import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmModuleOptions } from 'config/database.config';
import { configModuleValidationSchema } from 'config/env-validation.config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MainModule } from './main/main.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configModuleValidationSchema,
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    UserModule,
    AuthModule,
    MainModule,

  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
