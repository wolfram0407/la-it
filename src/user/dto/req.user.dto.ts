import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReqUpdateUserInfoDto {
    @ApiProperty({ required: true, example: '홍길동' })
    @IsNotEmpty({ message: '닉네임을 적어주세요.' })
    @IsOptional()
    nickname: string;

    @ApiProperty({ example: 'testUrl' })
    @IsString()
    @IsOptional()
    profileImage: string;

    @ApiProperty({ required: true, example: 'test@test.com' })
    @IsEmail()
    @IsOptional()
    email: string;

    @ApiProperty({ required: true, example: 'test@test.com' })
    @IsString()
    @IsOptional()
    password: string;
}

export class ReqRegisterDto {
    @ApiProperty({ required: true, example: 'test@test.com' })
    @IsEmail()
    @IsOptional()
    email: string;

    @ApiProperty({ required: true, example: '홍길동' })
    @IsNotEmpty({ message: '닉네임을 적어주세요.' })
    @IsOptional()
    nickname: string;

    @ApiProperty({ required: true, example: 'test@test.com' })
    @IsString()
    @IsOptional()
    password: string;
}

export class ReqLoginDto {
    @ApiProperty({ required: true, example: 'test@gmail.com' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ required: true, example: 'test1234' })
    @IsNotEmpty()
    @IsString()
    password: string;
}
