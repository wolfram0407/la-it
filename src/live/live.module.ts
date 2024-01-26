import { Module } from '@nestjs/common';
import { LiveService } from './live.service';
import { LiveController } from './live.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Live } from './entities/live.entity';
import { Channel } from 'src/user/entities/channel.entity';
import { JwtModule } from '@nestjs/jwt';
import { ImageModule } from 'src/image/image.module';
import { PassportModule } from '@nestjs/passport';
import { User } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [JwtModule, PassportModule, ImageModule, UserModule, TypeOrmModule.forFeature([Live, Channel, User])],
    controllers: [LiveController],
    providers: [LiveService],
    exports: [LiveService],
})
export class LiveModule { }
