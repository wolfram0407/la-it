import { MainService } from './main/main.service';
import { UserService } from './user/user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, Redirect, Render, Req, Res, UseGuards } from '@nestjs/common';
import { LiveService } from './live/live.service';
import { UserInfo } from './common/decorator/user.decorator';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { Response } from 'express';
import { UserAfterAuth } from './auth/interfaces/after-auth';
import { Roles } from './common/decorator/role.decorator';
import { Role } from './common/types/userRoles.type';
import { RolesGuard } from './auth/guards/roles.guard';

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
        console.log(lives);
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
    myInfo() {
        return { title: 'My Page', path: '/my-page' };
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
    async provideLive(@Param('channelId') channelId: string) {
        console.log('ch ID =====> ', channelId);
        const channel = await this.userService.FindChannelIdByChannel(+channelId);
        const live = await this.liveService.findOneByChannelId(+channelId);
        const liveStatusValue = live.status;
        // if (liveStatusValue === true) {
        //     await this.liveService.end(+channelId);
        // }
        return { title: 'Streaming Page', path: '/streaming', channel, liveStatusValue };
    }

    @Render('main') // Render the 'main' EJS template
    @Get('search/:value')
    async searchPage(@Param('value') search: string) {
        const findValue = await this.mainService.findByBJName(search);
        console.log(findValue);
        return { title: 'Search Page', path: '/search', findValue };
    }
}
