import { IsNotEmpty } from 'class-validator';
import { PaymentType } from 'src/common/types/payment.type';

export class ChargePaymentStartDto {
    @IsNotEmpty({ message: '충전할 금액을 입력해주세요.' })
    paymentAmount: number;

    @IsNotEmpty({ message: '결제 수단을 선택해 주세요.' })
    paymentType: PaymentType;
}

export class ChargePaymentDto {
    @IsNotEmpty({ message: '충전할 하트 수량을 입력해주세요.' })
    chargeHeart: number;

    @IsNotEmpty({ message: '충전할 금액을 입력해주세요.' })
    paymentAmount: number;

    @IsNotEmpty({ message: '결제 수단을 선택해 주세요.' })
    paymentType: PaymentType;

    @IsNotEmpty({ message: '환불 금액을 입력해주세요.' })
    refundAmount: number;

    @IsNotEmpty({ message: '환불 계좌를 입력해주세요.' })
    refundAccount: string;
}

export class ConfirmPayment {
    @IsNotEmpty({ message: '결제금액 확인값은 필수값입니다.' })
    orderPrice: number;

    @IsNotEmpty({ message: 'paymentId는 필수값입니다.' })
    paymentId: string;
}
