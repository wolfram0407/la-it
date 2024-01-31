import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Live } from './entities/live.entity';
import { Channel } from 'src/user/entities/channel.entity';

@Injectable()
export class LiveService {
    constructor(
        @InjectRepository(Live)
        private liveRepository: Repository<Live>,
        @InjectRepository(Channel)
        private channelRepository: Repository<Channel>,
    ) {}

    async create(title: string, thumbnail: string, description: string, hlsUrl: string, channelId: number) {
        const channelColumn = await this.channelRepository.findOneBy({ channelId });
        console.log('channelColumn: ', channelColumn);
        const streamKey = channelColumn.streamKey;
        console.log('streamKey: ', streamKey);
        hlsUrl = `/tmp/hls/${streamKey}/index.m3u8`;

        const createLive = await this.liveRepository.save({
            title,
            thumbnail,
            description,
            hlsUrl,
            channel: channelColumn,
        });

        return createLive;
    }

    async end(channelId: number) {
        const endLive = await this.liveRepository.update({ channel: { channelId } }, { status: false });
        return endLive;
    }

    async findAll(): Promise<Live[]> {
        const allLive: Live[] = await this.liveRepository.find({ relations: ['channel'], where: { status: true } });
        return allLive;
    }

    async findOne(liveId: number) {
        const live = await this.liveRepository.findOne({ relations: ['channel'], where: { live_id: liveId } });
        return live;
    }

    async findOneByChannelId(channelId: number) {
        const channel = await this.liveRepository.findOne({ where: { channel: { channelId } } });
        return channel;
    }

    async findByChannelIdOnlyCurrentLive(channelId: number) {
        const liveDataFromChannel = await this.liveRepository.findOne({ where: { channel: { channelId } }, order: { createdAt: 'DESC' } });
        return liveDataFromChannel;
    }

    async update(liveId: number, title: string, thumbnail: string) {
        const updateLive = await this.liveRepository.update(liveId, {
            thumbnail,
            title,
        });
        return this.findOne(liveId);
    }

    async remove(liveId: number) {
        const deleteLive = await this.liveRepository.delete(liveId);
        return this.findAll();
    }
}
