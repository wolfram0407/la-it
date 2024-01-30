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
    constructor(
        @InjectRepository(Payment)
        private paymentRepository: Repository<Payment>,
    ) {}

    //충전하기
    async chargePaymentStart(userId: number, paymentAmount, paymentType) {
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
    }

    //검증하기
    async paymentChargeConfirm(paymentAmount, paymentId) {
        try {
            // 1. 포트원 API를 사용하기 위해 액세스 토큰을 발급
            const signinResponse = await fetch('https://api.portone.io/login/api-secret', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiSecret: process.env.PORTONE_API_SECRET }),
            });
            if (!signinResponse.ok) throw new Error(`portone_signinResponse: ${signinResponse.statusText}`);

            const { accessToken } = await signinResponse.json();

            // 2. 포트원 결제내역 단건조회 API 호출
            const paymentResponse = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`, {
                headers: { Authorization: 'Bearer ' + accessToken },
            });
            if (!paymentResponse.ok) throw new Error(`결제내역 조회 paymentResponse: ${paymentResponse.statusText}`);
            const payment = await paymentResponse.json();

            // 3. 고객사 내부 주문 데이터의 가격과 실제 지불된 금액을 비교합니다.
            //const paymentAmountData = await this.getPaymentAmountData(paymentAmount);
            //if (paymentAmountData.amount === payment.amount.total) {
            if (paymentAmount === payment.amount.total) {
                switch (payment.status) {
                    case 'VIRTUAL_ACCOUNT_ISSUED': {
                        const paymentMethod = payment.paymentMethod;
                        console.log('paymentMethod', paymentMethod);
                        // 가상 계좌가 발급된 상태입니다.
                        // 계좌 정보를 이용해 원하는 로직을 구성하세요.
                        break;
                    }
                    case 'PAID': {
                        // 모든 금액을 지불했습니다! 완료 시 원하는 로직을 구성하세요.
                        break;
                    }
                }
            } else {
                // 결제 금액이 불일치하여 위/변조 시도가 의심됩니다.
            }
        } catch (err) {
            console.log(err);
        }
    }

    //충전 검증 후 저장단계..
    async createPaymentData(paymentType, paymentAmount, refundAccount, refundAmount, userId) {
        const createPaymentData = await this.paymentRepository.save({
            paymentType,
            paymentAmount,
            refundAccount,
            refundAmount,
            userId,
        });
        console.log('결제테이블 데이터 저장 성공', createPaymentData);
        return createPaymentData;
    }
}
