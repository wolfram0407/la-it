import { MainService } from './main/main.service';
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
export class AppController {
    constructor(
        private readonly userService: UserService,
        private readonly liveService: LiveService,
        private readonly mainService: MainService,
    ) {}

    @Get()
    @Render('main') // Render the 'main' EJS template
    async main(@Req() req) {
        const lives = await this.liveService.findAll();
        return { title: 'Home Page', path: req.url, lives: lives };
    }

    @Get('live/:liveId')
    @Render('main') // Render the 'main' EJS template
    async live(@Param('liveId') liveId: string, @Res() res: Response) {
        const live = await this.liveService.findOne(+liveId);
        return { title: 'Live - User view page', path: '/live', live: live };
    }

    @UseGuards(JwtAuthGuard)
    @Get('/my-page')
    async userInfo(@UserInfo() user: UserAfterAuth) {
        // 내채널 클릭 시 Id값 필요
        const channel = await this.userService.findChannelIdByUserId(user.id);
        return channel.channelId;
    }

    @Get('my-page/:channelId')
    @Render('main') // Render the 'main' EJS template
    async myInfo(@Param('channelId') channelId: number) {
        console.log('_________');
        // 내채널 클릭 시 Id값 필요
        const channel = await this.userService.FindChannelIdByChannel(channelId);
        console.log('channel가져옴', channel);
        return { title: 'My Page', path: '/my-page', channel: { ...channel, channelId: channelId } };
        //return { title: 'User - channel info view page', path: '/my-page', live: live };
    }

    @UseGuards(JwtAuthGuard)
    @Get('/streaming')
    async streamingInfo(@UserInfo() user: UserAfterAuth) {
        // 내채널 클릭 시 Id값 필요
        const channel = await this.userService.findChannelIdByUserId(user.id);
        return channel.channelId;
    }

    @Get('streaming/:channelId')
    @Render('main') // Render the 'main' EJS template
    async provideLive(@Param('channelId') channelId: string, @Req() req) {
        const channel = await this.userService.FindChannelIdByChannel(+channelId);
        const live = await this.liveService.findOneByChannelId(+channelId);
        //const liveStatusValue = live.status;
        // if (liveStatusValue === true) {
        //     await this.liveService.end(+channelId);
        // }
        //return { title: 'Streaming Page', path: '/streaming', channel, liveStatusValue };

        return { title: 'Streaming Page', path: '/streaming', channel, hlsUrl: `${process.env.HLSURL}` };
        // hls url 추가해서 환경변수로 관리 
        // 'http://localhost:8080'
    }

    @Render('main') // Render the 'main' EJS template
    @Get('search/:value')
    async searchPage(@Param('value') search: string) {
        const searchs = await this.mainService.findByBJName(search);
        let searchState = true;
        if (!searchs.channelSearch) {
            searchState = false;
        }
        return { title: 'Search Page', path: '/search', searchs, searchState, search };
    }
}
