
import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({
  name: "channels",
})
export class Channel
{

  @PrimaryGeneratedColumn({ name: 'channel_id' })
  channelId: number

  @Column({ nullable: true })
  description: string

  @Column({ name: 'profile_image', nullable: true })
  channelImage: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

}
