import { Controller, Get, Post, Redirect, Req, Res, UseGuards, Request, Response } from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';

import { KakaoAuthGuard } from './guards/kakao.guard';
import { ConfigService } from '@nestjs/config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController
{
  constructor(
    private readonly configService: ConfigService
  ) { }

  @UseGuards(KakaoAuthGuard)
  @Get('login/kakao')
  async kakao(
    @Req() req
  ): Promise<void>
  {

  }

  @Redirect('/')
  @UseGuards(KakaoAuthGuard)
  @Get('/login/kakao/callback')
  async callbacks(
    @Req() req, @Res() res: Response
  )
  {
    // 토큰 확인용 주석
    console.log(req.user)
    return
  }


}
