import { Category } from 'src/common/types/heart.category.type';
import { Channel } from 'src/user/entities/channel.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('hearts')
export class Heart {
    @PrimaryGeneratedColumn({ name: 'heart_id', unsigned: true })
    heartId: number;

    @Column({ name: 'total_heart', unsigned: true })
    totalHeart: number;

    @Column({ name: 'total_money', unsigned: true })
    totalMoney: number;

    @Column({ name: 'heart_usage', unsigned: true })
    heartUsage: number;

    @Column({ type: 'enum', enum: Category })
    category: Category;

    @Column({ name: 'heart_message', nullable: true })
    heartMessage: string;

    @Column({ name: 'heart_additions', unsigned: true })
    heartAdditions: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.heart, { onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;
    @Column({ type: 'int' })
    userId: number;

    @ManyToOne(() => Channel, (channel) => channel.heart, { onDelete: 'CASCADE' })
    @JoinColumn()
    channel: Channel;
    @Column({ type: 'int' })
    channelId: number;
}
