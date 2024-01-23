import { MainService } from './main.service';
import { Body, Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReqSearchDto } from './dto/req.search.dto';

@ApiTags('Main')
@Controller('/api/main')
export class MainController
{
  constructor(private readonly mainService: MainService) { }


  @Get('search/:search')
  async search(
    @Param() { search }: ReqSearchDto
  )
  {
    return await this.mainService.findByBJName(search)
  }
}

