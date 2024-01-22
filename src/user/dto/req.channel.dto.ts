import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";


export class ReqUpdateChannelImageDto
{
  @ApiProperty({ required: true, example: 'TestImageUrl', description: '이미지경로' })
  @IsString()
  imageUrl: string

  @ApiProperty({ required: true, default: true, example: 'true', description: 'true: update / false: default image' })
  @IsBoolean()
  reset: boolean

}
