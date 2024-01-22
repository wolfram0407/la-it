import { Controller, Get, Request, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserInfo } from 'src/common/decorator/user.decorator';
import { UserAfterAuth } from 'src/auth/interfaces/after-auth';



@Controller('user')
export class UserController
{
  constructor(private readonly userService: UserService) { }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/api')
  async temp(
    @UserInfo() { id }: UserAfterAuth
  )
  {
    console.log(id);
  }

}
