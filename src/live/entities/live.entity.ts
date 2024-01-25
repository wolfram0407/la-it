import { Channel } from 'src/user/entities/channel.entity';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
@Entity({
    name: 'lives',
})
export class Live {
    @PrimaryGeneratedColumn({ unsigned: true })
    live_id: number;

    @Column({ type: 'varchar', nullable: false })
    thumbnail: string;

    @Column({ type: 'varchar', nullable: false })
    title: string;

    @Column({ type: 'varchar' })
    description: string;

    @Column({ type: 'varchar', name: 'hls_url' })
    hlsUrl: string;

    @Column({ type: 'boolean', default: true })
    status: boolean;

    @ManyToOne(() => Channel, (channel) => channel.channelId, { cascade: true })
    @JoinColumn({ name: 'channel_id' })
    channel: Channel;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', select: false })
    deletedAt: Date;
}
