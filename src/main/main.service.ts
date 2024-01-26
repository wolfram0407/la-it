import { Injectable } from '@nestjs/common';
import { LiveService } from 'src/live/live.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class MainService
{
  constructor(
    private readonly userService: UserService,
    private readonly liveService: LiveService
  ) { }



  async findByBJName(search: string) 
  {
    const channelSearch = await this.userService.findChannelBySearch(search);

    // 해당검색값의 BJ의 동영상 중 최신 검색

    // 해당검색값을 타이틀로 검색해서 출력

    return {
      channelSearch
    }
  }


}
