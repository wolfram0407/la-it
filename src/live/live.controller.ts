import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LiveService } from './live.service';
import { ReqCreateLiveDto, ReqUpdateLiveDto } from './dto/req.live.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Live')
@Controller('/api/live')
export class LiveController {
    constructor(private readonly liveService: LiveService) {}

    @ApiOperation({
        summary: '라이브 등록',
        description: '라이브 등록',
    })
    @Post('create/:channelId')
    create(@Body() { title, description }: ReqCreateLiveDto, thumbnail: string, hlsUrl: string, @Param('channelId') channelId: string) {
        // console.log('!');
        return this.liveService.create(title, description, thumbnail, hlsUrl, channelId);
    }

    @ApiOperation({
        summary: '라이브 종료',
        description: '라이브 종료',
    })
    @Post('end/:channelId')
    end(@Param('channelId') channelId: string) {
        return this.liveService.end(channelId);
        //socket에서 하는것과 중복되어 주석처리.
    }

    @Get()
    findAll() {
        return this.liveService.findAll();
    }

    @Get(':liveId')
    findOne(@Param('liveId') liveId: string) {
        return this.liveService.findOne(+liveId);
    }

    @Patch(':liveId')
    update(@Param('liveId') liveId: string, @Body() { title }: ReqUpdateLiveDto) {
        return this.liveService.update(+liveId, title);
    }

    @Delete(':liveId')
    remove(@Param('liveId') liveId: string) {
        return this.liveService.remove(+liveId);
    }
}
