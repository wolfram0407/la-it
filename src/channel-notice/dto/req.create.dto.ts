import {ApiProperty} from "@nestjs/swagger"
import {NoticeAllowComments} from "../types/channel-notice.type";
import {IsEnum, IsNotEmpty, IsString} from "class-validator";

export class NoticeCreateReqDto {


  @ApiProperty({required: true, example: "공지사항 제목입니다."})
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({required: true, example: "공지사항 컨텐츠입니다."})
  @IsString()
  @IsNotEmpty()
  contents: string;

  @ApiProperty({required: true, enum: NoticeAllowComments})
  @IsEnum(NoticeAllowComments)
  @IsNotEmpty()
  commentsAllow !: NoticeAllowComments

}