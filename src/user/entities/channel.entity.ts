import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Live } from 'src/live/entities/live.entity';

@Entity('channels')
export class Channel {
    @PrimaryGeneratedColumn({ name: 'channel_id', unsigned: true })
    channelId: number;

    @Column({ nullable: true })
    description: string;

    @Column({ name: 'profile_image', nullable: true })
    channelImage: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date;

    @OneToOne(() => User, (user) => user.channelId)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToOne(() => Live, (live) => live.live_id, { cascade: true })
    @JoinColumn({ name: 'live_id' })
    live: Live;
}
