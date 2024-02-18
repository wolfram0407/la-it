import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { UserInfo } from 'src/common/decorator/user.decorator';
import { UserAfterAuth } from 'src/auth/interfaces/after-auth';
import { ReqUpdateChannelImageDto, ReqUpdateChannelInfoDto } from './dto/req.channel.dto';
import { ResUpdateChannelImageDto } from './dto/res.channel.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorator/role.decorator';
import { Role } from 'src/common/types/userRoles.type';
import { ReqLoginDto, ReqRegisterDto, ReqUpdateUserInfoDto } from './dto/req.user.dto';

@ApiTags('UserInfo')
@ApiExtraModels(ResUpdateChannelImageDto)
@Controller('/api')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/user/authCheck')
    async isLoginUserCheck() {
        return true;
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/user')
    async temp(@UserInfo() { id }: UserAfterAuth) {
        return await this.userService.findUserIdByUser(+id);
    }
    /*
    유저 정보
  */
    @Put('/user/:id')
    async userInfo(@Param('id') id: string, @Body() { nickname, profileImage, email }: ReqUpdateUserInfoDto) {
        return await this.userService.updateUserInfo(+id, nickname, profileImage, email);
    }

    /*
  채널 정보
  */

    //
    // update channel information
    //@Put('/channel/info/:id')
    //async updateChannelInfo(@Param('id') id: string, @Body() { description, channelImage }: ReqUpdateChannelInfoDto) {
    //    return await this.userService.updateChannelInfo(+id, description, channelImage);
    //}

    @Put('/channel/info/:id')
    @UseGuards(JwtAuthGuard)
    async updateChannelInfo(@Param('id') id: string, @Body() data: ReqUpdateChannelInfoDto) {
        // console.log('컨트롤러', id, data);
        return await this.userService.updateChannelInfo(id, data.channelName, data.description, data.channelImage);
    }

    // channel profile update
    @Put('/channel/update/:id')
    async updatImage(@Param('id') id: string, @Body() { imageUrl, reset }: ReqUpdateChannelImageDto): Promise<ResUpdateChannelImageDto> {
        if (reset) {
            // console.log('!!');
            return await this.userService.updateChannelImage(id, imageUrl);
        }
        const defaultUrl = '/testUrl';
        return await this.userService.updateChannelImage(id, defaultUrl);
    }

    @Put('/channel/change-key/:id')
    async changeStreamKey(@Param('id') id: string) {
        // console.log('유저 컨트롤러 체인지', id);
        return await this.userService.changeStreamKey(id);
    }

    @Post('/user/register')
    async register(@Res() res, @Body() reqRegisterDto: ReqRegisterDto) {
        const exitUser = await this.userService.findByEmail(reqRegisterDto.email);

        if (exitUser) {
            return res.status(409).json({ message: '이미 등록된 이메일입니다.' });
        }

        await this.userService.register(reqRegisterDto);
        return res.status(201).json({ message: '회원가입 성공' });
    }

    @ApiBearerAuth()
    @Roles(Role.User)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    @Put('/channel/stream/:id')
    async resetStreamKey(@Param('id') id: string) {
        return await this.userService.resetStreamKey(id);
    }
}
