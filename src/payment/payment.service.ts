import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Heart } from 'src/heart/entities/heart.entity';
import { DataSource, Repository } from 'typeorm';
import { ChargePaymentStartDto } from './dto/charge-payment.dto';
import * as PortOne from '@portone/browser-sdk/v2';
import crypto from 'crypto';

@Injectable()
export class PaymentService {
    constructor() //@InjectRepository(Payment)
    //private paymentRepository: Repository<Payment>,
    //@InjectRepository(Heart)
    //private heartRepository: Repository<Heart>,
    //private dataSource: DataSource,
    {}

    //충전하기
    async chargePaymentStart(userId: number, chargePaymentStartDto: ChargePaymentStartDto) {
        const { paymentAmount, paymentType } = chargePaymentStartDto;
        try {
            //포트원에게 결제 요청
            const response = await PortOne.requestPayment({
                // Store ID 설정
                storeId: process.env.PORTONE_STORE_ID,
                // 채널 키 설정
                channelKey: process.env.PORTONE_CHANNEL_KEY,
                paymentId: `payment-${crypto.randomUUID()}`,
                orderName: '하트 충전',
                totalAmount: paymentAmount,
                currency: 'CURRENCY_KRW',
                payMethod: paymentType,
            });
            console.log('payment의 response', response);
            return response;
        } catch (err) {
            console.log(err);
        }
        return 'This action adds a new payment';
    }

    findAll() {
        return `This action returns all payment`;
    }

    findOne(id: number) {
        return `This action returns a #${id} payment`;
    }
}
