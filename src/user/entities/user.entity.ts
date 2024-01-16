
import { Role } from "src/common/types/userRoles.type";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Channel } from "./channel.entity";


@Entity("users")
export class User
{

  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number

  @Column({ name: 'kakao_id' })
  kakaoId: string

  @Column({ nullable: true })
  email: string

  @Column({ nullable: true })
  provider: string

  @Column({ nullable: false })
  nickname: string

  @Column({ name: 'profile_image', nullable: false })
  profileImage: string

  @Column({ type: 'enum', enum: Role, default: Role.User })
  role: Role

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToOne(() => Channel, (channel) => channel.user)
  channelId: number
}
