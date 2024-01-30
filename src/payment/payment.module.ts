import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { HeartModule } from 'src/heart/heart.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Heart } from 'src/heart/entities/heart.entity';

@Module({
    //imports: [HeartModule, TypeOrmModule.forFeature([Heart])],
    controllers: [PaymentController],
    providers: [PaymentService],
    exports: [PaymentService],
})
export class PaymentModule {}
