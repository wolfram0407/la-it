import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Live } from './entities/live.entity';

@Injectable()
export class LiveService {
    constructor(
        @InjectRepository(Live)
        private liveRepository: Repository<Live>,
    ) {}

    async create(title: string, userName: string, thumbnail: string, userImage: string) {
        const createLive = await this.liveRepository.save({
            userName,
            userImage,
            thumbnail,
            title,
        });

        return createLive;
    }

    async findAll(): Promise<Live[]> {
        const allLive: Live[] = await this.liveRepository.find();
        return allLive;
    }

    async findOne(liveId: number) {
        const live = await this.liveRepository.findOne({ where: { live_id: liveId } });
        return live;
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
