import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ReqUpdateUserInfoDto
{

  @ApiProperty({ required: true, example: "홍길동" })
  @IsNotEmpty()
  @IsOptional()
  nickname: string

  @ApiProperty({ required: true, example: "testUrl" })
  @IsString()
  @IsOptional()
  profileImage: string

  @ApiProperty({ required: true, example: "test@test.com" })
  @IsEmail()
  @IsOptional()
  email: string
}