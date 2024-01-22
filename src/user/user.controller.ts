import { Body, Controller, Delete, Get, Param, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { UserInfo } from 'src/common/decorator/user.decorator';
import { UserAfterAuth } from 'src/auth/interfaces/after-auth';
import { ReqUpdateChannelImageDto } from './dto/req.channel.dto';
import { ResUpdateChannelImageDto } from './dto/res.channel.dto';


@ApiTags('UserInfo')
@ApiExtraModels(ResUpdateChannelImageDto)
@Controller('/api')
export class UserController
{
  constructor(private readonly userService: UserService) { }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('')
  async temp(
    @UserInfo() { id }: UserAfterAuth
  )
  {
    console.log(id);
  }

  /*
  채널 정보
  */

  // update channel information


  // channel profile update
  @Put('/channel/update/:id')
  async updatImage(
    @Param('id') id: string,
    @Body() { imageUrl, reset }: ReqUpdateChannelImageDto
  ): Promise<ResUpdateChannelImageDto>
  {
    if (reset)
    {
      return await this.userService.updateChannelImage(+id, imageUrl)
    }
    const defaultUrl = 'http://localhost:3000/testUrl';
    return await this.userService.updateChannelImage(+id, defaultUrl)

  }

  @Put('/channel/change-key/:id')
  async changeStreamKey(
    @Param('id') id: string,
  )
  {
    return await this.userService.changeStreamKey(+id)
  }
}
