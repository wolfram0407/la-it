import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserAfterAuth } from 'src/auth/interfaces/after-auth';
import { UserInfo } from 'src/common/decorator/user.decorator';
import { PaymentService } from './payment.service';
import { ResultPayment } from './types/res.types';
import { ChargePaymentStartDto } from './dto/charge-payment.dto';

@Controller('/api/payments')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    @UseGuards(JwtAuthGuard)
    @Post('/charge')
    async chargePayment(@UserInfo() { id }: UserAfterAuth, @Body() { paymentAmount, paymentType }: { paymentAmount; paymentType }): Promise<ResultPayment> {
        const chargePaymentStart = this.paymentService.chargePaymentStart(+id, paymentAmount, paymentType);
        if (!chargePaymentStart) {
            return {
                statusCode: 500,
                message: '하트 충전에 실패했습니다. 잠시 후 다시 시도해 주세요.',
                data: {},
            };
        }
        return {
            statusCode: 201,
            message: '하트 충전 완료',
            data: chargePaymentStart,
        };
    }

    ////결제 완료 처리.
    //@UseGuards(JwtAuthGuard)
    //@Post('/complete')
    //async paymentConfirm(@Body() { paymentAmount, paymentId }: ConfirmPayment) {
    //    try {
    //        // 1. 포트원 API를 사용하기 위해 액세스 토큰을 발급
    //        const signinResponse = await fetch('https://api.portone.io/login/api-secret', {
    //            method: 'POST',
    //            headers: { 'Content-Type': 'application/json' },
    //            body: JSON.stringify({ apiSecret: process.env.PORTONE_API_SECRET }),
    //        });
    //        if (!signinResponse.ok) throw new Error(`portone_signinResponse: ${signinResponse.statusText}`);

    //        const { accessToken } = await signinResponse.json();

    //        // 2. 포트원 결제내역 단건조회 API 호출
    //        const paymentResponse = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`, {
    //            headers: { Authorization: 'Bearer ' + accessToken },
    //        });
    //        if (!paymentResponse.ok) throw new Error(`결제내역 조회 paymentResponse: ${paymentResponse.statusText}`);
    //        const payment = await paymentResponse.json();

    //        // 3. 고객사 내부 주문 데이터의 가격과 실제 지불된 금액을 비교합니다.
    //        const paymentAmountData = await this.heartService.getPaymentAmountData(paymentAmount);
    //        if (paymentAmountData.amount === payment.amount.total) {
    //            switch (payment.status) {
    //                case 'VIRTUAL_ACCOUNT_ISSUED': {
    //                    const paymentMethod = payment.paymentMethod;
    //                    // 가상 계좌가 발급된 상태입니다.
    //                    // 계좌 정보를 이용해 원하는 로직을 구성하세요.
    //                    break;
    //                }
    //                case 'PAID': {
    //                    // 모든 금액을 지불했습니다! 완료 시 원하는 로직을 구성하세요.
    //                    break;
    //                }
    //            }
    //        } else {
    //            // 결제 금액이 불일치하여 위/변조 시도가 의심됩니다.
    //        }
    //    } catch (err) {
    //        console.log(err);
    //    }
    //}
}
