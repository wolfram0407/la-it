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

    async create(title: string, description: string, thumbnail: string, hlsUrl: string, channelId: string) {
        const channelColumn = await this.channelRepository.findOneBy({ channelId });
        console.log('channelColumn: ', channelColumn);
        const streamKey = channelColumn.streamKey;
        console.log('streamKey: ', streamKey);
        hlsUrl = `/tmp/hls/${streamKey}/index.m3u8`;
        thumbnail = `/thumb/thumbnail_${streamKey}.png`;

        const createLive = await this.liveRepository.save({
            title,
            description,
            thumbnail,
            hlsUrl,
            channel: channelColumn,
        });

        return createLive;
    }

    async end(channelId: string) {
        const endTargetLive = await this.findOneByChannelId(channelId);
        console.log('endTargetLive', endTargetLive);
        if (!endTargetLive) return;
        const updateStatusLive = await this.liveRepository.update(endTargetLive?.live_id, { status: false });
        //endTargetLive.status = false;
        //const updateStatusLive = await this.liveRepository.save(endTargetLive);

        return updateStatusLive;
    }

    async findAll(): Promise<Live[]> {
        const allLive: Live[] = await this.liveRepository.find({ relations: ['channel'], where: { status: true } });
        return allLive;
    }

    async findOne(liveId: number) {
        const live = await this.liveRepository.findOne({ relations: ['channel'], where: { live_id: liveId } });
        return live;
    }

    async findOneByChannelId(channelId: string) {
        const channel = await this.liveRepository.findOne({ where: { channel: { channelId }, status: true } });
        return channel;
    }

    async findByChannelIdOnlyCurrentLive(channelId: string) {
        const liveDataFromChannel = await this.liveRepository.findOne({ where: { channel: { channelId } }, order: { createdAt: 'DESC' } });
        return liveDataFromChannel;
    }

    async update(liveId: number, title: string) {
        const updateLive = await this.liveRepository.update(liveId, {
            title,
        });
        return this.findOne(liveId);
    }

    async remove(liveId: number) {
        const deleteLive = await this.liveRepository.delete(liveId);
        return this.findAll();
    }
}
