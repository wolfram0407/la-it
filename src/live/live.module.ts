import { Module } from '@nestjs/common';
import { LiveService } from './live.service';
import { LiveController } from './live.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Live } from './entities/live.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Live])],
    controllers: [LiveController],
    providers: [LiveService],
    exports: [LiveService]
})
export class LiveModule { }
