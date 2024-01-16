import { channel } from 'diagnostics_channel';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ReqCreateUserDto } from 'src/auth/dto/req.auth.dto';
import { Channel } from './entities/channel.entity';


@Injectable()
export class UserService
{
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,

  ) { }

  async create(reqCreateUserDto: ReqCreateUserDto)
  {
    const { kakaoId, nickname, profileImage, provider } = reqCreateUserDto;
    const user = await this.userRepository.save({
      kakaoId,
      nickname,
      profileImage,
      provider
    })


    return user
  }


  async findByKakaoId(id: string): Promise<any> 
  {
    const user = this.userRepository.findOne({
      where: { kakaoId: id }
    })

    return user
  }




}
