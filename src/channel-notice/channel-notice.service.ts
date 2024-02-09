import { UserService } from './../user/user.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelNotice } from './entities/channel-board.entity';
import { Repository } from 'typeorm';
import { NoticeAllowComments } from './types/channel-notice.type';

@Injectable()
export class ChannelNoticeService {
    constructor(
        @InjectRepository(ChannelNotice)
        private readonly channelNotice: Repository<ChannelNotice>,
    ) {}
    // create Notice
    async createNotice(channelId: string, title: string, contents: string, commentsAllow: NoticeAllowComments) {
        const newNotice = await this.channelNotice.save(
            this.channelNotice.create({
                title,
                contents,
                commentsAllow,
                //channel: { channelsId },
            }),
        );

        return newNotice;
    }

    //
    async getAllNotice(channelId: string) {
        // channel id 추가해야됨
        return await this.channelNotice.find();
    }
}
