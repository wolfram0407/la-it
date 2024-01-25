import { UserService } from './user/user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, Redirect, Render, Req, Res, UseGuards } from '@nestjs/common';
import { LiveService } from './live/live.service';
import { UserInfo } from './common/decorator/user.decorator';
import { User } from './user/entities/user.entity';
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
        @UserInfo() user: User,
    )
    {
        const accessToken = req.cookies.authorization
        console.log(accessToken)
        if (accessToken)
        {

        }
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
    userInfo(
        @UserInfo() user: UserAfterAuth,
    )
    {
        return user.id
    }

    @Get('my-page/:channelId')
    @Render('main') // Render the 'main' EJS template
    myInfo(
        @UserInfo() user: UserAfterAuth,
    )
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
