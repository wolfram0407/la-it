import { Channel } from 'src/user/entities/channel.entity';
import { ConflictException, HttpException, Injectable, NotAcceptableException, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, Like, Repository } from 'typeorm';
import { ReqCreateUserDto } from 'src/auth/dto/req.auth.dto';
import crypto from 'crypto';
import { ReqRegisterDto, ReqUpdateUserInfoDto, ReqLoginDto } from './dto/req.user.dto';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Channel)
        private readonly channelRepository: Repository<Channel>,
        private dataSource: DataSource,
        private readonly jwtService: JwtService,
    ) {}

    async createUserAndChannel(reqCreateUserDto: ReqCreateUserDto) {
        const { kakaoId, nickname, profileImage, provider } = reqCreateUserDto;
        const randomId = () => crypto.randomBytes(8).toString('hex').toString();
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
                streamKey: randomId(),
                user: user,
            });

            return user;
        } catch (error) {
            // console.log(error);
            throw new ServiceUnavailableException();
        }
    }

    async register(reqRegisterDto: ReqRegisterDto) {
        const { email, nickname, password } = reqRegisterDto;
        const existUser = await this.userRepository.findOne({ where: { email } });
        if (existUser) {
            throw new ConflictException('이미 등록된 이메일입니다.');
        }
        const hashedPassword = await hash(password, 10);
        const randomId = () => crypto.randomBytes(8).toString('hex').toString();
        const dummyHashValue = crypto.createHash('sha256').update(email).digest('hex');
        try {
            const newUser = await this.userRepository.save({
                kakaoId: dummyHashValue,
                email,
                nickname,
                password: hashedPassword,
            });

            // user channel create
            const newChannel = await this.channelRepository.save({
                description: '',
                channelImage: '/imgs/defaultProfileImage.png',
                streamKey: randomId(),
                user: newUser,
            });
            return newUser;
        } catch (error) {
            throw new ServiceUnavailableException();
        }
    }

    async findUserIdByUser(userId: number) {
        const user = this.userRepository.findOne({
            where: { userId },
        });
        return user;
    }

    async findByUserIdGetUserName(id: number) {
        const user = this.userRepository.findOne({
            where: { userId: id },
            select: ['userId', 'nickname'],
        });
        return user;
    }

    async findByEmail(email: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { email: email },
        });
        // console.log('email user ===> ', user);
        return user;
    }

    async updateUserInfo(userId: number, nickname: string, profileImage: string, email: string) {
        try {
            const user = await this.userRepository.findOne({
                where: { userId },
            });

            user.nickname = nickname ? nickname : user.nickname;
            user.profileImage = profileImage ? profileImage : user.profileImage;
            user.email = email ? email : user.email;
            return await this.userRepository.save(user);
        } catch (error) {
            // console.log(error);
        }
    }
    async findByKakaoId(id: string) {
        const user = this.userRepository.findOne({
            where: { kakaoId: id },
        });
        return user;
    }

    async findChannelBySearch(search: string) {
        try {
            const channel = await this.dataSource.getRepository(Channel).query(
                `select * from channels 
            left join lives 
            on channels.channel_id = lives.channel_id
            where lives.status = ? 
            and channels.channel_name LIKE ?;`,
                [true, `%${search}%`],
            );

            return channel;
        } catch (error) {
            throw new NotAcceptableException('채널검색');
        }
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

    /*
  채널 정보
  */

    // channel 전체 조회
    async getChannelImageByChannelId(id: string) {
        try {
            const channel = await this.channelRepository.findBy({ channelId: id });
            return channel;
        } catch (error) {}
    }

    async findChannelIdByUserId(userId: number) {
        try {
            const channel = await this.channelRepository.findOne({
                where: {
                    user: { userId },
                },
            });
            return channel;
        } catch (error) {}
    }
    async FindChannelIdByChannel(id: string) {
        try {
            const channel = await this.channelRepository.findOne({ where: { channelId: id } });
            return channel;
        } catch (error) {}
    }

    // channel information update
    async updateChannelInfo(id: string, channelName: string, description: string, channelImage: string) {
        try {
            // console.log('서비스', id, channelName, description, channelImage);
            const channel = await this.channelRepository.findOne({ where: { channelId: id } });
            channel.channelName = channelName ? channelName : channel.channelName;
            channel.description = description ? description : channel.description;
            channel.channelImage = channelImage ? channelImage : channel.channelImage;
            return await this.channelRepository.save(channel);
        } catch (error) {
            // console.log(error);
        }
    }
    // channel Image update
    async updateChannelImage(id: string, channelImage: string) {
        try {
            const channel = await this.channelRepository.findOne({ where: { channelId: id } });
            channel.channelImage = channelImage;
            return await this.channelRepository.save(channel);
        } catch (error) {
            // console.log(error);
        }
    }

    // change Stream Key
    async changeStreamKey(id: string) {
        const randomId = () => crypto.randomBytes(8).toString('hex').toString();
        try {
            const channel = await this.channelRepository.findOne({ where: { channelId: id } });
            channel.streamKey = randomId();
            return await this.channelRepository.save(channel);
        } catch (error) {
            // console.log(error);
        }
    }

    async resetStreamKey(id: string) {
        try {
            const channel = await this.channelRepository.findOne({ where: { channelId: id } });
            channel.streamKey = '';
            return await this.channelRepository.save(channel);
        } catch (error) {
            // console.log(error);
        }
    }
}
