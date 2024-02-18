import { Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ReqLoginDto } from 'src/user/dto/req.user.dto';
import { UserService } from 'src/user/user.service';
import { compare, hash } from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {}

    async validateUser(kakaoId: string) {
        const user = await this.userService.findByKakaoId(kakaoId);
        if (!user) {
            return null;
        }
        return user;
    }

    // Access token 만료기간 2주
    async createAccessToken(id: number) {
        return await this.jwtService.signAsync({ sub: id, token: 'Access' }, { expiresIn: '1d' });
    }

    // refresh token 만료기간 2주
    async createRefreshToken(id: number) {
        return await this.jwtService.signAsync({ sub: id, token: 'Refresh' }, { expiresIn: '14d' });
    }

    async login(email: string, password: string) {
        const user = await this.userService.findByEmail(email);
        console.log('user!!!!! ', user);
        if (!user) {
            throw new UnauthorizedException('등록되지 않은 사용자입니다.');
        }

        const encodePassword = await compare(password, user.password);
        console.log(encodePassword);
        if (!encodePassword) {
            throw new UnauthorizedException('등록되지 않은 사용자입니다.');
        }

        const access_token = await this.createAccessToken(user.userId);
        console.log('accesstoken!!! ', access_token);
        const Bearer = 'Bearer ' + access_token;
        console.log('Bearer: ', Bearer);

        return { access_token: Bearer };
    }
}
