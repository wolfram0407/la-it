import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    OneToMany,
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

    @Column({ name: 'channel_name', nullable: true })
    channelName: string;

    @Column({ nullable: true })
    description: string;

    @Column({ name: 'profile_image', nullable: true })
    channelImage: string;

    @Column({ name: 'steam_key', nullable: true })
    streamKey: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date;

    @OneToOne(() => User, (user) => user.channelId)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => Live, (live) => live.live_id, { cascade: true })
    live: Live;
}
