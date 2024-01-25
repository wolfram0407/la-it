import { Channel } from 'src/user/entities/channel.entity';
import { HttpException, Injectable, NotAcceptableException, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Like, Repository } from 'typeorm';
import { ReqCreateUserDto } from 'src/auth/dto/req.auth.dto';
import crypto from 'crypto';


@Injectable()
export class UserService
{
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
  ) { }

  async createUserAndChannel(reqCreateUserDto: ReqCreateUserDto)
  {
    const { kakaoId, nickname, profileImage, provider } = reqCreateUserDto;
    const randomId = () => crypto.randomBytes(8).toString('hex').toString();
    try
    {
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
        user: user
      });
      console.log(userChannel);
      return user;
    } catch (error)
    {
      console.log(error);
      throw new ServiceUnavailableException();
    }
  }

  async findUserIdByUser(userId: number)
  {
    const user = this.userRepository.findOne({
      where: { userId },
    });
    return user;
  }

  async updateUserInfo(userId: number, nickname: string, profileImage: string, email: string)
  {
    try
    {
      const user = await this.userRepository.findOne({
        where: { userId },
      });

      user.nickname = nickname ? nickname : user.nickname;
      user.profileImage = profileImage ? profileImage : user.profileImage;
      user.email = email ? email : user.email;
      return await this.userRepository.save(user);

    } catch (error)
    {
      console.log(error);
    }
  }
  async findByKakaoId(id: string)
  {
    const user = this.userRepository.findOne({
      where: { kakaoId: id },
    });
    return user;
  }

  async findChannelBySearch(search: string)
  {
    try
    {
      const channel = this.channelRepository.findOne({
        where: { channelName: Like(`%${search}%`) },
      });
      console.log(channel);
      return channel;
    } catch (error)
    {
      throw new NotAcceptableException('채널검색');
    }
  }

  async findByKakaoIdGetUserName(id: number)
  {
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
  async getChannelImageByChannelId(id: number)
  {
    try
    {
      const channel = await this.channelRepository.findBy({ channelId: id });
      return channel
    } catch (error)
    {

    }
  }
  async findChannelIdByUserId(userId: number)
  {
    try
    {
      const channel = await this.channelRepository.findOne({
        where: {
          user: { userId }
        }
      });
      return channel
    } catch (error)
    {

    }
  }
  async FindChannelIdByChannel(id: number)
  {
    try
    {
      const channel = await this.channelRepository.findOne({ where: { channelId: id } });
      return channel
    } catch (error)
    {

    }
  }
  // channel information update
  async updateChannelInfo(id: number, description: string, channelImage: string)
  {
    try
    {
      const channel = await this.channelRepository.findOne({ where: { channelId: id } });
      channel.description = description ? description : channel.description;
      channel.channelImage = channelImage ? channelImage : channel.channelImage;
      return await this.channelRepository.save(channel);
    } catch (error)
    {
      console.log(error)
    }
  }
  // channel Image update
  async updateChannelImage(id: number, channelImage: string)
  {
    try
    {
      const channel = await this.channelRepository.findOne({ where: { channelId: id } });
      channel.channelImage = channelImage;
      return await this.channelRepository.save(channel);
    } catch (error)
    {
      console.log(error)
    }
  }

  // change Stream Key
  async changeStreamKey(id: number)
  {
    const randomId = () => crypto.randomBytes(8).toString('hex').toString();
    try
    {
      const channel = await this.channelRepository.findOne({ where: { channelId: id } });
      channel.streamKey = randomId()
      return await this.channelRepository.save(channel);
    } catch (error)
    {
      console.log(error)
    }
  }

  async resetStreamKey(id: number)
  {
    try
    {
      const channel = await this.channelRepository.findOne({ where: { channelId: id } });
      channel.streamKey = '';
      return await this.channelRepository.save(channel);
    } catch (error)
    {
      console.log(error)
    }
  }
}
