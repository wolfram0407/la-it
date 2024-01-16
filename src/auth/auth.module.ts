import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { KakaoStrategy } from './strategies/kakao.strategy'
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        global: true,
        secret: config.get<string>('JWT_SECRET_KEY'),
        signOptions: { expiresIn: '1d' },
      })
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    KakaoStrategy,

  ],
})
export class AuthModule { }
