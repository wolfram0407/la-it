import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";


export class ReqUpdateUserInfoByAdmin
{
  @ApiProperty({ required: true, example: 200000 })
  @IsNumber()
  @IsNotEmpty()
  point: number
}