import { Response } from 'express';
import { Controller, Get, Post, Redirect, Req, UseGuards, Request, Res, Body } from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';

import { KakaoAuthGuard } from './guards/kakao.guard';
import { ConfigService } from '@nestjs/config';
import { ReqLoginDto } from 'src/user/dto/req.user.dto';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('/api/auth')
export class AuthController {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
    ) {}

    @UseGuards(KakaoAuthGuard)
    @Get('login/kakao')
    async kakao(@Req() req): Promise<void> {}

    @UseGuards(KakaoAuthGuard)
    @Redirect('/')
    @Get('/login/kakao/callback')
    async callbacks(@Req() req, @Res({ passthrough: true }) res) {
        // console.log(req.user.access_token)
        res.cookie('Authorization', req.user.access_token);
    }

    @Redirect('/')
    @Post('/login')
    async login(@Body() loginDto: ReqLoginDto, @Res() res: Response) {
        const { email, password } = loginDto;
        console.log('login controller~~', email, password);
        const { access_token } = await this.authService.login(email, password);

        return res.cookie('Authorization', access_token);
    }
}
