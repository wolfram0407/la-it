import { Controller, Get, Render } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Frontend')
@Controller()
export class AppController
{
    constructor(

    ) { }


    @Get('/')
    @Render('main') // Render the 'main' EJS template
    main()
    {
        return { title: 'Home Page' }; // Pass data to the template
    }

    @Get('live')
    @Render('livePage') // Render the 'main' EJS template
    live()
    {
        return { title: 'Live Page' }; // Pass data to the template
    }

    @Get('my-page')
    @Render('channelInfo') // Render the 'main' EJS template
    myInfo()
    {
        return { title: 'My Page' }; // Pass data to the template
    }

    @Get('live-master')
    @Render('live-provide-page') // Render the 'main' EJS template
    provideLive()
    {
        return { title: 'My Page' }; // Pass data to the template
    }
}
