import { MainService } from './main/main.service';
import { UserService } from './user/user.service';
import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Inject, Logger, Param, Query, Render, Req, UseGuards } from '@nestjs/common';
import { LiveService } from './live/live.service';
import { UserInfo } from './common/decorator/user.decorator';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { UserAfterAuth } from './auth/interfaces/after-auth';
import { RedisClientType } from 'redis';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChatService } from './chat/chat.service';

@ApiTags('Frontend')
@Controller()
export class AppController {
    constructor(
        private readonly userService: UserService,
        private readonly liveService: LiveService,
        private readonly mainService: MainService,
        private readonly chatService: ChatService,

        @Inject('REDIS_CLIENT') private readonly redis: RedisClientType,
    ) {}

    @WebSocketServer() server: Server;
    @Get()
    @Render('main') // Render the 'main' EJS template
    async main(@Req() req, @Query() query: object) {
        const status = query['s'] ? query['s'] : false;
        if (!status && Object.keys(query).length !== 0) throw new Error('정상적인 접근이 아닙니다.1');
        Logger.log('스테이터스가 있다면 리로드 되고 있다.', status);
        const lives = await this.liveService.findAll();
        let roomUserCtn;
        Logger.log('__roomUserCtn', roomUserCtn);
        if (lives) {
            roomUserCtn = await this.chatService.roomUserCtn();
            lives.map((e) => {
                const channelId = e.channel.channelId;
                e.channel['watchNum'] = roomUserCtn[channelId];
            });
        }
        const livesIncludeHlsUrl = { lives, hlsUrl: process.env.HLS_URL };
        return { title: 'Home Page', path: req.url, livesIncludeHlsUrl, status };
    }

    @Get('register')
    @Render('main')
    async register(@Req() req) {
        return { title: 'Register Page', path: '/register' };
    }

    @Get('login')
    @Render('main')
    async login(@Req() req) {
        // console.log('login!!!');
        return { title: 'Login Page', path: '/login' };
    }

    @Get('channel/:channelId')
    @Render('main')
    async live(@Param('channelId') channelId: string, @Query() query: string) {
        console.log('쿼리', query);
        if (Object.keys(query).length !== 0) throw new Error('정상적인 접근이 아닙니다.');
        const channel = await this.userService.FindChannelIdByChannel(channelId);
        if (!channel) throw new Error('존재하지 않는 방송입니다.');
        const live = await this.liveService.findByChannelIdOnlyCurrentLive(channelId);
        console.log('live', live);
        if (!live) throw new Error('이미 종료된 방송입니다.');
        const channelLive = { ...channel, ...live };

        return { title: 'Live - User view page', path: '/channel', channelLive: { channelLive, hlsUrl: process.env.HLS_URL } };
    }

    @UseGuards(JwtAuthGuard)
    @Get('/my-page')
    async userInfo(@UserInfo() user: UserAfterAuth) {
        const channel = await this.userService.findChannelIdByUserId(user.id);
        return channel.channelId;
    }

    @Get('my-page/:channelId')
    @Render('main')
    async myInfo(@Param('channelId') channelId: string, @Query() query: string) {
        if (Object.keys(query).length !== 0) throw new Error('정상적인 접근이 아닙니다.');
        const channel = await this.userService.FindChannelIdByChannel(channelId);
        if (!channel) throw new Error('정상적인 접근이 아닙니다.');
        return { title: 'My Page', path: '/my-page', channel: { ...channel, channelId: channelId } };
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
    async provideLive(@Param('channelId') channelId: string, @Req() req, @Query() query: string) {
        if (Object.keys(query).length !== 0) throw new Error('정상적인 접근이 아닙니다.');
        const channel = await this.userService.FindChannelIdByChannel(channelId);

        if (!channel) throw new Error('정상적인 접근이 아닙니다.');
        const live = await this.liveService.findOneByChannelId(channelId);
        let liveIsGoing;
        if (live) {
            liveIsGoing = false;
        }
        const liveStatusValue = live ? live.status : false;
        const liveTitle = live ? live.title : false;
        const liveDesc = live ? live.description : false;
        channel['liveStatusValue'] = liveStatusValue;
        channel['liveTitle'] = liveTitle;
        channel['liveDesc'] = liveDesc;
        return { title: 'Streaming Page', path: '/streaming', channel: { channel, hlsUrl: `${process.env.HLS_URL}`, liveIsGoing } };
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

    @Render('payment')
    @Get('payments/charge')
    async paymentsCharge() {
        return { title: 'Payments Charge Page', path: '/payments/charge' };
    }
}
