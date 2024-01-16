import { Body, Controller, Get, Post, Redirect, Req, Res, UseGuards, Request, Response } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { ReqCreateUserDto } from './dto/req.auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { SocialUser, SocialUserAfterAuth } from 'src/common/decorator/user.decorator';
import { KakaoAuthGuard } from './guards/kakao.guard';
import { ConfigService } from '@nestjs/config';


@ApiTags('Auth')
@Controller('auth')
export class AuthController
{
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) { }




  @UseGuards(KakaoAuthGuard)
  @Get('login/kakao')
  async kakao(
    @Req() req
  ): Promise<void>
  {

  }

  @UseGuards(KakaoAuthGuard)
  @Get('/login/kakao/callback')
  async callbacks(
    @Req() req, @Res() res: Response
  )
  {
    console.log("!")
    console.log(req.user)

  }


}
