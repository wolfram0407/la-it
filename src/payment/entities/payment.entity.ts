import { PaymentType } from 'src/common/types/payment.type';
import { User } from 'src/user/entities/user.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn({ name: 'payment_id', unsigned: true })
    paymentId: number;

    //paymentType  // paymentAmount   //accountForRefund
    @Column({ name: 'payment_type', type: 'enum', enum: PaymentType })
    paymentType: PaymentType;

    @Column({ name: 'payment_amount', unsigned: true })
    paymentAmount: number;

    @Column({ name: 'refund_account' })
    refundAccount: string;

    @Column({ name: 'refund_amount', unsigned: true })
    refundAmount: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.payment, { onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;
    @Column({ type: 'int' })
    userId: number;
}
