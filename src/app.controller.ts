import { UserService } from './user/user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, Redirect, Render, Req, Res, UseGuards } from '@nestjs/common';
import { LiveService } from './live/live.service';
import { UserInfo } from './common/decorator/user.decorator';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { Response } from 'express';
import { UserAfterAuth } from './auth/interfaces/after-auth';

@ApiTags('Frontend')
@Controller()
export class AppController
{
    constructor(
        private readonly userService: UserService,
        private readonly liveService: LiveService,
    ) { }

    @Get()
    @Render('main') // Render the 'main' EJS template
    async main(
        @Req() req,
    )
    {
        const lives = await this.liveService.findAll();
        return { title: 'Home Page', path: req.url, lives: lives };
    }

    @Get('live/:liveId')
    @Render('main') // Render the 'main' EJS template
    async live(@Param('liveId') liveId: string, @Res() res: Response)
    {
        const live = await this.liveService.findOne(+liveId);
        return { title: 'Live - User view page', path: '/live', live: live };
    }

    @UseGuards(JwtAuthGuard)
    @Get('/my-page')
    async userInfo(
        @UserInfo() user: UserAfterAuth,
    )
    {
        // 내채널 클릭 시 Id값 필요
        const channel = await this.userService.findChannelIdByUserId(user.id)
        return channel.channelId;
    }

    @Get('my-page/:channelId')
    @Render('main') // Render the 'main' EJS template
    myInfo()
    {
        return { title: 'My Page', path: '/my-page' };
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('streaming/:channelId')
    @Render('main') // Render the 'main' EJS template
    async provideLive(@Param('channelId') channelId: string, @Req() req)
    {
        console.log(req.cookies)
        const channel = await this.userService.FindChannelIdByChannel(+channelId);

        const live = await this.liveService.findOneByChannelId(+channelId);

        return { title: 'Streaming Page', path: '/streaming', channel, live };
    }
}
