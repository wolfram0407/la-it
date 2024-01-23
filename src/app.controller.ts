import { UserService } from './user/user.service';
import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Render, Req } from '@nestjs/common';
import { LiveService } from './live/live.service';

@ApiTags('Frontend')
@Controller()
export class AppController
{
    constructor(
        private readonly userService: UserService,
        private readonly liveService: LiveService
    ) { }

    @Get()
    @Render('main') // Render the 'main' EJS template
    async main(@Req() req)
    {
        const lives = await this.liveService.findAll();
        console.log(lives);
        return { title: 'Home Page', path: req.url, lives: lives }; // Pass data to the template
    }

    @Get('live')
    @Render('main') // Render the 'main' EJS template
    live(@Req() req)
    {
        return { title: 'Live Page', path: req.url }; // Pass data to the template
    }

    @Get('my-page')
    @Render('main') // Render the 'main' EJS template
    myInfo(@Req() req)
    {
        return { title: 'My Page', path: req.url }; // Pass data to the template
    }

    @Get('live-master')
    @Render('main') // Render the 'main' EJS template
    provideLive(@Req() req)
    {
        return { title: 'live-master', path: req.url }; // Pass data to the template
    }
}
