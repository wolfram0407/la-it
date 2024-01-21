import { response } from 'express';
import { Controller, Get, Post, Redirect, Req, UseGuards, Request, Response, Res } from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';

import { KakaoAuthGuard } from './guards/kakao.guard';
import { ConfigService } from '@nestjs/config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly configService: ConfigService) {}

    @UseGuards(KakaoAuthGuard)
    @Get('login/kakao')
    async kakao(@Req() req): Promise<void> {}

    @Redirect('/')
    @UseGuards(KakaoAuthGuard)
    @Get('/login/kakao/callback')
    async callbacks(@Req() req, @Res() res) {
        console.log(req.user);

        // 토큰 확인용 주석
        //const token = req.user.access_token;
        //res.cookie('Authorization', token); //
        //res.redirect('http://localhost:3002'); //
        return req.user;
    }
}
