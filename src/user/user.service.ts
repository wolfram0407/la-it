import { HttpException, Injectable, NotAcceptableException, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Like, Repository } from 'typeorm';
import { ReqCreateUserDto } from 'src/auth/dto/req.auth.dto';
import { Channel } from './entities/channel.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Channel)
        private readonly channelRepository: Repository<Channel>,
    ) {}

    async create(reqCreateUserDto: ReqCreateUserDto) {
        const { kakaoId, nickname, profileImage, provider } = reqCreateUserDto;
        try {
            // user create
            const user = await this.userRepository.save({
                kakaoId,
                nickname,
                profileImage,
                provider,
            });
            // user channel create
            const userChannel = await this.channelRepository.save({
                description: '',
                channelImage: profileImage,
                user_id: user.userId,
            });
            return user;
        } catch (error) {
            console.log(error);
            throw new ServiceUnavailableException();
        }
    }

    async findByKakaoId(id: string) {
        const user = this.userRepository.findOne({
            where: { kakaoId: id },
        });
        return user;
    }

    async findByNickname(search: string) {
        try {
            const user = this.userRepository.findOne({
                where: { nickname: Like(`%${search}%`) },
            });
            return user;
        } catch (error) {
            throw new NotAcceptableException('닉네임검색');
        }
    }

    async findByKakaoIdGetUserName(id: number) {
        const user = this.userRepository.findOne({
            where: { userId: id },
            select: ['nickname'],
        });
        return user;
    }
}
