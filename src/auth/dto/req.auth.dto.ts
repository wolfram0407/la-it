import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

// 회원가입
export class ReqCreateUserDto
{
  @IsNotEmpty()
  kakaoId: string

  @IsNotEmpty()
  @IsString()
  nickname: string

  @IsString()
  @IsNotEmpty()
  profileImage: string

  @IsString()
  @IsNotEmpty()
  provider: string
}

// 채널 생성
export class ReqCreateChannelDto 
{

  @ApiProperty({ required: true, example: "" })
  @IsString()
  @IsNotEmpty()
  description: string

  @ApiProperty({ required: true, example: "" })
  @IsString()
  @IsNotEmpty()
  channelImage: string
}
