import { Controller, Get, Render, Req } from '@nestjs/common';

@Controller()
export class AppController {
    @Get()
    @Render('main') // Render the 'main' EJS template
    main(@Req() req) {
        return { title: 'Home Page', path: req.url }; // Pass data to the template
    }

    @Get('live')
    @Render('main') // Render the 'main' EJS template
    live(@Req() req) {
        return { title: 'Live Page', path: req.url }; // Pass data to the template
    }

    @Get('my-page')
    @Render('main') // Render the 'main' EJS template
    myInfo(@Req() req) {
        return { title: 'My Page', path: req.url }; // Pass data to the template
    }

    @Get('live-master')
    @Render('main') // Render the 'main' EJS template
    provideLive(@Req() req) {
        return { title: 'live-master', path: req.url }; // Pass data to the template
    }
}
