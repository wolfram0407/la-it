import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { KakaoStrategy } from './strategies/kakao.strategy';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt', session: false }),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                global: true,
                secret: config.get<string>('JWT_SECRET_KEY'),
                signOptions: { expiresIn: '14d' },
            }),
        }),
        UserModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, KakaoStrategy, JwtStrategy],
    exports: [AuthService],
})
export class AuthModule {}
