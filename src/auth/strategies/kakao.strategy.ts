import { UserService } from 'src/user/user.service';
import { AuthService } from './../auth.service';

import { Injectable, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-kakao';
import * as _ from 'lodash';
import { Response } from 'express';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
        private readonly userService: UserService,
    )
    {
        super({
            clientID: configService.get<string>('KAKAO_KEY'),
            callbackURL: '/api/auth/login/kakao/callback',
        });
    }
    async validate(accessToken: string, refreshToken: string, profile: Profile, done: any, @Res() res: Response): Promise<any>
    {
        const kakaoId = profile.id;
        const nickname = profile._json.properties.nickname;
        const profileImage = profile._json.properties.profile_image;
        const provider = profile.provider;
        let user = await this.authService.validateUser(kakaoId);
        if (!user)
        {
            // 회원가입 진행
            user = await this.userService.createUserAndChannel({ kakaoId, nickname, profileImage, provider });
            console.log(user);
        }

        const access_token = await this.authService.createAccessToken(user.userId);
        console.log('access_token', access_token);
        //const refresh_token = await this.authService.createRefreshToken(user.userId);

        return { access_token };
    }
}
