import {Body, Controller, Get, Param, Post, UseGuards} from '@nestjs/common';
import {ChannelNoticeService} from './channel-notice.service';
import {ApiBearerAuth, ApiBody, ApiTags} from '@nestjs/swagger';
import {NoticeCreateReqDto} from './dto/req.create.dto';
import {JwtAuthGuard} from 'src/auth/guards/jwt-auth.guard';
import {UserAfterAuth} from 'src/auth/interfaces/after-auth';
import {UserInfo} from 'src/common/decorator/user.decorator';

@ApiTags('Channel Notice')
@UseGuards(JwtAuthGuard)
@Controller('/api/channel-notice')
export class ChannelNoticeController {

  constructor(private readonly channelNoticeService: ChannelNoticeService) {
  }

  @ApiBearerAuth()
  @Post('/create/:channelId')
  createNotice(
    @Param('channelId') channelId: string,
    @UserInfo() {id}: UserAfterAuth,
    @Body() {title, contents, commentsAllow}: NoticeCreateReqDto
  ) {
    return this.channelNoticeService.createNotice(+channelId, title, contents, commentsAllow);
  }

  @ApiBearerAuth()
  @Get('/:channelId')
  async getAll(
    @Param('channelId') channelId: string,
  ) {
    return this.channelNoticeService.getAllNotice(+channelId)
  }

  @ApiBearerAuth()
  @Get('/:channelId/:noteId')
  async getOneNotice(
    @Param('channelId') channelId: string,
    @Param('noteId') noteId: string,
  ) {
    return this.channelNoticeService.getAllNotice(+noteId)
  }

}
