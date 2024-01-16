import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, Matches } from "class-validator";
import { UUID } from "crypto";
// 회원가입
export class ReqCreateUserDto
{

  @IsUUID()
  @IsNotEmpty()
  kakaoId: string


  @ApiProperty({ required: true, example: '홍길동' })
  @IsNotEmpty()
  @IsString()
  nickname: string

  @ApiProperty({ required: true, example: 'EYsQMY0QMYgAQyCggCEAAYsQMYgAQyDQgDEAAYgw' })
  @IsString()
  @IsNotEmpty()
  profileImage: string

  @IsString()
  @IsNotEmpty()
  provider: string


}

// 로그인
export class ReqLoginDto extends PickType(ReqCreateUserDto, [] as const) { }