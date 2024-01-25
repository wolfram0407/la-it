import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';

@Injectable()
export class ImageService {
    s3Client: S3Client;

    constructor(private configService: ConfigService) {
        //s3인스턴스 초기화.
        this.s3Client = new S3Client({
            region: this.configService.get('AWS_REGION'),
            credentials: {
                accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
                secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
            },
        });
    }

    async saveImage(
        fileName: string,
        file: Express.Multer.File, //파일 데이터 포함.
        ext: string, //파일확장자
    ) {
        const command = new PutObjectCommand({
            //PutObjectCommand는 s3객체 업로드 할때 사용.
            Bucket: this.configService.get('AWS_BUCKET_NAME'),
            Key: fileName,
            Body: file.buffer, //파일의 실제 데이터
            ACL: 'public-read',
            ContentType: `image/${ext}`,
        });

        await this.s3Client.send(command);
        return `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_BUCKET_NAME}/${fileName}`;
    }
}
