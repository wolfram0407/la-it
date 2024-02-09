import { IsDate, IsNumber, IsString } from 'class-validator';

export class ResUpdateChannelImageDto {
    @IsNumber()
    channelId: string;

    @IsString()
    description: string;

    @IsString()
    channelImage: string;

    @IsString()
    streamKey: string;

    @IsDate()
    createdAt: Date;

    @IsDate()
    updatedAt: Date;

    @IsDate()
    deletedAt: Date;
}
