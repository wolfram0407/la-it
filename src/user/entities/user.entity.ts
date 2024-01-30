import { Role } from 'src/common/types/userRoles.type';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Channel } from './channel.entity';
import { Heart } from 'src/heart/entities/heart.entity';
import { Payment } from 'src/heart/entities/payment.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn({ name: 'user_id' })
    userId: number;

    @Column({ name: 'kakao_id' })
    kakaoId: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    provider: string;

    @Column({ nullable: true, unique: true })
    nickname: string;

    @Column({ name: 'profile_image', nullable: true })
    profileImage: string;

    @Column({ type: 'enum', enum: Role, default: Role.User })
    role: Role;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date;

    @OneToOne(() => Channel, (channel) => channel.user)
    channelId: number;

    @OneToMany(() => Heart, (heart) => heart.user, { cascade: true })
    heart: Heart[];

    @OneToMany(() => Payment, (payment) => payment.user, { cascade: true })
    payment: Payment[];
}
