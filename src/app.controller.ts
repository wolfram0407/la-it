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
        return { title: 'Live Page', path: '/live', live: live };
    }

    @Get('my-page')
    @Render('main') // Render the 'main' EJS template
    myInfo(@Req() req) {
        return { title: 'My Page', path: req.url };
    }

    @Get('live-master/:channelId')
    @Render('main') // Render the 'main' EJS template
    async provideLive(@Param('channelId') channelId: string, @Req() req) {
        //const channel = await this.userService.FindChannelIdByChannel(+channelId);
        //console.log(channel);
        //return { title: 'live-master', path: '/live-master', channel };
    }
}
