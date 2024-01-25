import { UserService } from './user/user.service';
import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, Render, Req, Res } from '@nestjs/common';
import { LiveService } from './live/live.service';

@ApiTags('Frontend')
@Controller()
export class AppController {
    constructor(
        private readonly userService: UserService,
        private readonly liveService: LiveService,
    ) {}

    @Get()
    @Render('main') // Render the 'main' EJS template
    async main(@Req() req) {
        const lives = await this.liveService.findAll();
        console.log(lives);
        return { title: 'Home Page', path: req.url, lives: lives };
    }

    @Get('live/:liveId')
    @Render('main') // Render the 'main' EJS template
    async live(@Param('liveId') liveId: string, @Res() res: Response) {
        const live = await this.liveService.findOne(+liveId);
        console.log(live);
        return { title: 'Live - User view page', path: '/live', live: live };
    }

    @Get('my-page/:channelId')
    @Render('main') // Render the 'main' EJS template
    myInfo(@Req() req) {
        return { title: 'My Page', path: '/my-page' };
    }

    @Get('setting/:channelId')
    @Render('channelSetting')
    myChannelManagement(@Req() req) {
        return { title: 'My Page Channel Setting', path: 'setting/:channelId' };
    }

    @Get('streaming/:channelId')
    @Render('main') // Render the 'main' EJS template
    async provideLive(@Param('channelId') channelId: string, @Req() req) {
        const channel = await this.userService.FindChannelIdByChannel(+channelId);
        console.log('channel: ', channel);
        const live = await this.liveService.findOneByChannelId(+channelId);
        console.log('live: ', live);

        return { title: 'Streaming Page', path: '/streaming', channel, live };
    }
}
