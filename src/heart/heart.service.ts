import { Injectable } from '@nestjs/common';
import * as PortOne from '@portone/browser-sdk/v2';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Heart } from './entities/heart.entity';
import { Category } from 'src/common/types/heart.category.type';

@Injectable()
export class HeartService {
    //constructor() //@InjectRepository(Heart)
    //private heartRepository: Repository<Heart>,
    //{}
    ////충전하기.
    //async addHeartByCharge(userId, chargeHeart, paymentAmount, paymentType, refundAmount, refundAccount) {
    //    const queryRunner = this.dataSource.createQueryRunner();
    //    await queryRunner.connect();
    //    await queryRunner.startTransaction();
    //    try {
    //        const response = await PortOne.requestPayment({
    //            // Store ID 설정
    //            storeId: 'store-ef250734-e56b-4bd5-8ca9-adadded54b6f',
    //            // 채널 키 설정
    //            channelKey: 'channel-key-068f3f33-47b4-4730-9f23-e6db132e01f6',
    //            paymentId: `payment-${crypto.randomUUID()}`,
    //            orderName: '하트 충전',
    //            totalAmount: paymentAmount,
    //            currency: 'CURRENCY_KRW',
    //            payMethod: paymentType,
    //        });
    //        console.log('addHeartByCharge의 response', response);
    //        //const createPaymentData = await queryRunner.manager.getRepository(Payment).save({
    //        //    paymentType,
    //        //    paymentAmount,
    //        //    refundAccount,
    //        //    refundAmount,
    //        //    userId,
    //        //});
    //        //console.log('결제테이블 데이터 저장 성공', createPaymentData);
    //        //하트테이블 데이터 넣기.
    //        //1. 현재 유저의 하트 수 파악하기(하트테이블 조회해서 가져오기)
    //        //2. 하트데이터 추가하기.
    //        const findUserHeartData = await queryRunner.manager.getRepository(Heart).findOne({ where: { userId: userId } });
    //        const preTotalHeart = findUserHeartData.totalHeart;
    //        const createHeartData = await queryRunner.manager.getRepository(Heart).save({
    //            totalHeart: +preTotalHeart + +chargeHeart,
    //            totalMoney: +preTotalHeart * 100 + +chargeHeart * 100,
    //            heartUsage: 0,
    //            category: Category.charge,
    //            heartAdditions: +chargeHeart,
    //        });
    //        console.log('하트테이블 데이터 저장 성공', createHeartData);
    //        await queryRunner.commitTransaction();
    //    } catch (err) {
    //        console.log('err', err);
    //        await queryRunner.rollbackTransaction();
    //    } finally {
    //        await queryRunner.release();
    //    }
    //}
}
