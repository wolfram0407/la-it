import {Module} from '@nestjs/common';
import {ChannelNoticeController} from './channel-notice.controller';
import {ChannelNoticeService} from './channel-notice.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ChannelNotice} from './entities/channel-board.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChannelNotice]),
  ],
  controllers: [ChannelNoticeController],
  providers: [ChannelNoticeService]
})
export class ChannelNoticeModule {}
