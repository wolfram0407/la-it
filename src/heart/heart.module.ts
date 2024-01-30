import { Module } from '@nestjs/common';
import { HeartService } from './heart.service';
import { HeartController } from './heart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from 'src/payment/entities/payment.entity';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
    //imports: [PaymentModule, TypeOrmModule.forFeature([Payment])],
    controllers: [HeartController],
    providers: [HeartService],
    exports: [HeartService],
})
export class HeartModule {}
