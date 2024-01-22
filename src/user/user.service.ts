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
        user_id: user.userId,
      });

      return user;
    } catch (error)
    {
      console.log(error);
      throw new ServiceUnavailableException();
    }
  }

  async findByKakaoId(id: string)
  {
    const user = this.userRepository.findOne({
      where: { kakaoId: id },
    });
    return user;
  }

  async findByNickname(search: string)
  {
    try
    {
      const user = this.userRepository.findOne({
        where: { nickname: Like(`%${search}%`) },
      });
      return user;
    } catch (error)
    {
      throw new NotAcceptableException('닉네임검색');
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

}
