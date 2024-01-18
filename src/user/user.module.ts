import { Logger, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { Channel } from './entities/channel.entity';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [
    JwtModule,
    PassportModule,
    TypeOrmModule.forFeature([User, Channel])
  ],
  controllers: [UserController],
  providers: [UserService, Logger],
  exports: [UserService],

})
export class UserModule { }
