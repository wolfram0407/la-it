import {response} from 'express';
import {Controller, Get, Post, Redirect, Req, UseGuards, Request, Response, Res} from '@nestjs/common';

import {ApiTags} from '@nestjs/swagger';

import {KakaoAuthGuard} from './guards/kakao.guard';
import {ConfigService} from '@nestjs/config';

@ApiTags('Auth')
@Controller('/api/auth')
export class AuthController {
    constructor(private readonly configService: ConfigService) {}

    @UseGuards(KakaoAuthGuard)
    @Get('login/kakao')
    async kakao(@Req() req): Promise<void> {}

    @UseGuards(KakaoAuthGuard)
    @Redirect('/')
    @Get('/login/kakao/callback')
    async callbacks(@Req() req, @Res({passthrough: true}) res) {
        console.log(req.user.access_token)
        res.cookie('Authorization', req.user.access_token);
    }
}
