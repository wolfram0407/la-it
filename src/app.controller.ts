import { MainService } from './main/main.service';
import { UserService } from './user/user.service';
import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Inject, Logger, Param, Query, Render, Req, UseGuards } from '@nestjs/common';
import { LiveService } from './live/live.service';
import { UserInfo } from './common/decorator/user.decorator';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { UserAfterAuth } from './auth/interfaces/after-auth';
import { RedisClientType } from 'redis';

@ApiTags('Frontend')
@Controller()
export class AppController {
    constructor(
        private readonly userService: UserService,
        private readonly liveService: LiveService,
        private readonly mainService: MainService,
        @Inject('REDIS_CLIENT') private readonly redis: RedisClientType,
    ) {}

    @Get()
    @Render('main') // Render the 'main' EJS template
    async main(@Req() req, @Query('s') s) {
        const status = s ? s : false;
        Logger.log('스테이터스가 있다면 리로드 되고 있다.', status);
        const lives = await this.liveService.findAll();
        Logger.log('req', req);
        Logger.log('알이큐 헤더즈', req.headers); // 모든 헤더 출력
        Logger.log('알이큐 아이피', req.ip); // 요청한 클라이언트의 IP 주소
        Logger.log('알이큐 유저에이전트', req.headers['user-agent']); // 클라이언트의 User-Agent 값(어플 유형, 운영체제, 소프트웨어 버전)
        const getRedisData = await this.redis.hGetAll('watchCtn');
        // console.log('lives =======> ', lives);
        lives.map((e) => {
            const channelId = e.channel.channelId;
            const redisId = Object.keys(getRedisData);
            // console.log('getRedisData', getRedisData);
            // console.log('redisId', redisId);
            if (!redisId.length) {
                // console.log('없슈');
                // console.log('e', e);
                return (e.channel['watchNum'] = 0);
            } else {
                // console.log('잇슈슈슈슈');

                const findData = redisId.filter((e) => e === channelId)[0];
                // console.log('findData', findData, getRedisData[findData]);
                return (e.channel['watchNum'] = getRedisData[findData]);
            }
        });
        const livesIncludeHlsUrl = { lives, hlsUrl: process.env.HLS_URL };
        return { title: 'Home Page', path: req.url, livesIncludeHlsUrl, status };
    }

    @Get('register')
    @Render('main')
    async register(@Req() req) {
        // console.log('register!!!!');
        return { title: 'Register Page', path: '/register' };
    }

    @Get('login')
    @Render('main')
    async login(@Req() req) {
        console.log('login!!!');
        return { title: 'Login Page', path: '/login' };
    }
    //@Get('live/:liveId')
    //@Render('main') // Render the 'main' EJS template
    //async live(@Param('liveId') liveId: string, @Res() res: Response) {
    //    const live = await this.liveService.findOne(+liveId);
    //    return { title: 'Live - User view page', path: '/live', live: live };
    //}

    @Get('channel/:channelId')
    @Render('main')
    async live(@Param('channelId') channelId: string) {
        const channel = await this.userService.FindChannelIdByChannel(channelId);
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
    async myInfo(@Param('channelId') channelId: string) {
        // console.log('_________');
        // 내채널 클릭 시 Id값 필요
        const channel = await this.userService.FindChannelIdByChannel(channelId);
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
    async provideLive(@Param('channelId') channelId: string, @Req() req) {
        const channel = await this.userService.FindChannelIdByChannel(channelId);
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
