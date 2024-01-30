import {Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {NoticeAllowComments} from "../types/channel-notice.type";
import {Channel} from "src/user/entities/channel.entity";


@Entity('channel_notices')
export class ChannelNotice {

  @PrimaryGeneratedColumn({unsigned: true, name: 'notice_id'})
  noticeId: number;

  @Column({type: 'varchar', nullable: false})
  title: string;

  @Column({type: 'text', nullable: false})
  contents: string;

  @Column({type: 'enum', enum: NoticeAllowComments, nullable: false, name: 'comments_allow'})
  commentsAllow !: NoticeAllowComments

  @CreateDateColumn({name: 'created_at'})
  createdAt: Date;

  @UpdateDateColumn({name: 'updated_at'})
  updatedAt: Date;

  @DeleteDateColumn({name: 'deleted_at', select: false})
  deletedAt: Date;

  // Channel relationship
  @ManyToOne(() => Channel, (channel) => channel.channelId, {cascade: true})
  @JoinColumn({name: 'channel_id', })
  channel: Channel;

  // likes relationship

  // comments relationship

}