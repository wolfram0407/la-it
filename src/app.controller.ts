import { MainService } from './main/main.service';
import { UserService } from './user/user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Inject, Logger, Param, Query, Redirect, Render, Req, Res, UseGuards } from '@nestjs/common';
import { LiveService } from './live/live.service';
import { UserInfo } from './common/decorator/user.decorator';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { Response } from 'express';
import { UserAfterAuth } from './auth/interfaces/after-auth';
import { Roles } from './common/decorator/role.decorator';
import { Role } from './common/types/userRoles.type';
import { RolesGuard } from './auth/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { RedisClientType } from 'redis';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChatService } from './chat/chat.service';
import { boolean } from 'joi';

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
        //const getRedisData = await this.redis.hGetAll('watchCtn');
        //let getRedisData;
        const roomUserCtn = await this.chatService.roomUserCtn();
        console.log('__roomUserCtn', roomUserCtn);

        lives.map((e) => {
            const channelId = e.channel.channelId;
            //console.log('__channelId', channelId);
            //const roomWatcherCtn = roomUserCtn[channelId];
            //console.log('__roomWatcherCtn', roomWatcherCtn);
            e.channel['watchNum'] = roomUserCtn[channelId];

            //const roomUserCtn = this.server.sockets.adapter.rooms.get(channelId)?.size;
            //e.channel['watchNum'] = roomUserCtn;
            //const redisId = Object.keys(getRedisData);
            //if (!redisId.length) {
            //    return (e.channel['watchNum'] = 0);
            //} else {
            //    const findData = redisId.filter((e) => e === channelId)[0];
            //    return (e.channel['watchNum'] = getRedisData[findData]);
            //}
        });
        const livesIncludeHlsUrl = { lives, hlsUrl: process.env.HLS_URL };
        return { title: 'Home Page', path: req.url, livesIncludeHlsUrl, status };
    }

    @Get('register')
    @Render('main')
    async register(@Req() req) {
        return { title: 'Register Page', path: req.url };
    }

    @Get('login')
    @Render('main')
    async login(@Req() req) {
        // console.log('login!!!');
        return { title: 'Login Page', path: req.url };
    }
    //@Get('live/:liveId')
    //@Render('main') // Render the 'main' EJS template
    //async live(@Param('liveId') liveId: string, @Res() res: Response) {
    //    const live = await this.liveService.findOne(+liveId);
    //    return { title: 'Live - User view page', path: '/live', live: live };
    //}

    @Get('channel/:channelId')
    @Render('main')
    async live(@Param('channelId') channelId: string, @Query() query: string) {
        console.log('쿼리', query);
        if (Object.keys(query).length !== 0) throw new Error('정상적인 접근이 아닙니다.');
        const channel = await this.userService.FindChannelIdByChannel(channelId);
        if (!channel) throw new Error('존재하지 않는 방송입니다.');
        const live = await this.liveService.findByChannelIdOnlyCurrentLive(channelId);
        const channelLive = { ...channel, ...live };

        return { title: 'Live - User view page', path: '/channel', channelLive: { channelLive, hlsUrl: process.env.HLS_URL } };
    }

    @UseGuards(JwtAuthGuard)
    @Get('/my-page')
    async userInfo(@UserInfo() user: UserAfterAuth) {
        // 내채널 클릭 시 Id값 필요
        const channel = await this.userService.findChannelIdByUserId(user.id);
        // console.log('app.controller의 channel', channel);
        return channel.channelId;
    }

    @Get('my-page/:channelId')
    @Render('main') // Render the 'main' EJS template
    async myInfo(@Param('channelId') channelId: string, @Query() query: string) {
        // 내채널 클릭 시 Id값 필요
        if (Object.keys(query).length !== 0) throw new Error('정상적인 접근이 아닙니다.');
        const channel = await this.userService.FindChannelIdByChannel(channelId);
        if (!channel) throw new Error('정상적인 접근이 아닙니다.');
        // console.log('channel가져옴', channel);
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
    async provideLive(@Param('channelId') channelId: string, @Req() req, @Query() query: string) {
        console.log('스트리머 쿼리', query);
        if (Object.keys(query).length !== 0) throw new Error('정상적인 접근이 아닙니다.');
        const channel = await this.userService.FindChannelIdByChannel(channelId);
        console.log('channel', channel);

        if (!channel) throw new Error('정상적인 접근이 아닙니다.');
        const live = await this.liveService.findOneByChannelId(channelId);

        const liveStatusValue = live ? live.status : false;
        const liveTitle = live ? live.title : false;
        const liveDesc = live ? live.description : false;
        // if (liveStatusValue === true) {
        // await this.liveService.end(channelId);
        // }
        //return { title: 'Streaming Page', path: '/streaming', channel, liveStatusValue };
        channel['liveStatusValue'] = liveStatusValue;
        channel['liveTitle'] = liveTitle;
        channel['liveDesc'] = liveDesc;
        // console.log('!!!channel!!! =========> ', channel);
        return { title: 'Streaming Page', path: '/streaming', channel: { channel, hlsUrl: `${process.env.HLS_URL}` } };
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

    @Render('payment') // Render the 'main' EJS template
    @Get('payments/charge')
    async paymentsCharge() {
        // console.log('ddd');
        return { title: 'Payments Charge Page', path: '/payments/charge' };
    }
}
