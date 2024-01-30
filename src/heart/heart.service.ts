import { Injectable } from '@nestjs/common';
import * as PortOne from '@portone/browser-sdk/v2';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Heart } from './entities/heart.entity';
import { Category } from 'src/common/types/heart.category.type';

@Injectable()
export class HeartService {
    constructor(
        @InjectRepository(Heart)
        private heartRepository: Repository<Heart>,
    ) {}

    //충전하기.
    async addHeartByCharge(userId, chargeHeart) {
        try {
            //하트테이블 데이터 넣기.
            //1. 현재 유저의 하트 수 파악하기(하트테이블 조회해서 가져오기)
            //2. 하트데이터 추가하기.

            const findUserHeartData = await this.heartRepository.findOne({ where: { userId: userId } });
            const preTotalHeart = findUserHeartData.totalHeart;

            const createHeartData = await this.heartRepository.save({
                totalHeart: +preTotalHeart + +chargeHeart,
                totalMoney: +preTotalHeart * 100 + +chargeHeart * 100,
                heartUsage: 0,
                category: Category.charge,
                heartAdditions: +chargeHeart,
            });
            console.log('하트테이블 데이터 저장 성공', createHeartData);
        } catch (err) {
            console.log('err', err);
        }
    }
}
