import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReqCreateLiveDto {
    @ApiProperty({
        required: true,
        example: 'imageUrl://',
        description: '라이브 썸네일',
    })
    @IsString()
    @IsNotEmpty()
    thumbnail: string;

    @ApiProperty({
        required: true,
        example: '[LIVE] 실시간 스트리밍',
        description: '라이브 제목',
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        required: true,
        example: '먹방',
        description: '카테고리',
    })
    @IsString()
    @IsNotEmpty()
    category: string;
}

export class ReqUpdateLiveDto extends PartialType(ReqCreateLiveDto) {
    @ApiProperty({
        example: 'imageUrl://',
        description: '라이브 썸네일',
    })
    @IsString()
    @IsOptional()
    thumbnail?: string;

    @ApiProperty({
        example: '[LIVE] 실시간 스트리밍',
        description: '라이브 제목',
    })
    @IsString()
    @IsOptional()
    title?: string;
}
