import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

// 검색 
export class ReqSearchDto
{
  @ApiProperty({ description: '김블루', required: true })
  @IsString()
  @IsNotEmpty()
  search: string
}