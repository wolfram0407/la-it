import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService
{
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  )
  {

  }

  async validateUser(kakaoId: string)
  {
    const user = await this.userService.findByKakaoId(kakaoId)
    if (!user)
    {
      return null;
    }
    return user;
  }

  // Access token 만료기간 2주
  async createAccessToken(id: number)
  {
    return await this.jwtService.signAsync({ sub: id, token: "Access" }, { expiresIn: '1d' });
  }

  // refresh token 만료기간 2주
  async createRefreshToken(id: number)
  {
    return await this.jwtService.signAsync({ sub: id, token: "Refresh" }, { expiresIn: '14d' });
  }

}

