import { BeforeInsert, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Live } from 'src/live/entities/live.entity';
import { ChannelNotice } from 'src/channel-notice/entities/channel-board.entity';
import { Heart } from 'src/heart/entities/heart.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity('channels')
export class Channel {
    //@PrimaryColumn({ type: 'varchar', length: 36, name: 'channel_id' })
    //channelId: string;

    @PrimaryGeneratedColumn('uuid')
    channelId: string;

    @Column({ name: 'channel_name', nullable: true, default: ' ' })
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
    live: Live[];

    @OneToMany(() => ChannelNotice, (channelNotice) => channelNotice.noticeId)
    channelNotice: ChannelNotice[];

    @OneToMany(() => Heart, (heart) => heart.heartId, { cascade: true })
    heart: Heart[];

    //@BeforeInsert()
    //generateId() {
    //    this.channelId = uuidv4();
    //}
}
