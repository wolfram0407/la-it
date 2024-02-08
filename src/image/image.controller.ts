import { Body, Controller, HttpCode, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserInfo } from 'src/common/decorator/user.decorator';
import { UserAfterAuth } from 'src/auth/interfaces/after-auth';

@Controller('api/setting')
export class ImageController {
    constructor(private readonly imageService: ImageService) {}

    @Post('/:channelId')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async saveImage(@Body() data, @UploadedFile() file: Express.Multer.File, @Param() channelId: string, @UserInfo() { id }: UserAfterAuth) {
        console.log('!');
        try {
            console.log('이미지 데이터', data);
            const exp = file.mimetype.slice(6);
            const fileName = `${id}_${channelId['channelId']}_채널이미지`;

            const saveImageToS3 = await this.imageService.saveImage(fileName, file, exp);
            console.log('saveImageToS3', saveImageToS3);
            if (saveImageToS3) {
                return {
                    success: true,
                    message: '성공적으로 채널 정보 이미지를 업데이트 했습니다.',
                    data: saveImageToS3,
                };
            } else {
                return {
                    success: false,
                    message: '채널 정보 이미지 업데이트에 실패 했습니다.',
                };
            }
        } catch (err) {
            console.log('err', err);
        }
    }
}
