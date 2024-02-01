import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { HeartService } from './heart.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserAfterAuth } from 'src/auth/interfaces/after-auth';
import { UserInfo } from 'src/common/decorator/user.decorator';
import { ResultAddHeart } from './types/res.types';

@Controller('payments')
export class HeartController {
    constructor(private readonly heartService: HeartService) {}

    //@UseGuards(JwtAuthGuard)
    //@Post()
    //async addHeartByCharge(@UserInfo() { id }: UserAfterAuth, @Body() addHeartDto: AddHeartDto): Promise<ResultAddHeart> {
    //    const { chargeHeart, paymentAmount, paymentType, refundAmount, refundAccount } = addHeartDto;
    //    const addHeartByChargeResult = this.heartService.addHeartByCharge(+id, chargeHeart, paymentAmount, paymentType, refundAmount, refundAccount);
    //    if (!addHeartByChargeResult) {
    //        return {
    //            statusCode: 500,
    //            message: '하트 충전에 실패했습니다. 잠시 후 다시 시도해 주세요.',
    //        };
    //    }
    //    return {
    //        statusCode: 201,
    //        message: '하트 충전 완료',
    //    };
    //}

    ////결제 완료 처리.
    //@UseGuards(JwtAuthGuard)
    //@Post('complete')
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
    //            // 1번에서 발급받은 액세스 토큰을 Bearer 형식에 맞게 넣어주세요.
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

    //@Get(':id')
    //findOne(@Param('id') id: string) {
    //    return this.heartService.findOne(+id);
    //}

    //@Patch(':id')
    //update(@Param('id') id: string, @Body() updateHeartDto: UpdateHeartDto) {
    //    return this.heartService.update(+id, updateHeartDto);
    //}

    //@Delete(':id')
    //remove(@Param('id') id: string) {
    //    return this.heartService.remove(+id);
    //}
}
