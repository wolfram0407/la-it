import { Module } from '@nestjs/common';
import { HeartService } from './heart.service';
import { HeartController } from './heart.controller';

@Module({
    imports: [],
    controllers: [HeartController],
    providers: [HeartService],
})
export class HeartModule {}
