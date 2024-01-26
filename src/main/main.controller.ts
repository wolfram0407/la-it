import { MainService } from './main.service';
import { Body, Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReqSearchDto } from './dto/req.search.dto';
import { ThrottlerBehindProxyGuard } from 'src/common/guard/throttler-behind-proxy.guard';

@ApiTags('Main')
@Controller('/api/main')
export class MainController {
    constructor(private readonly mainService: MainService) {}

    @UseGuards(ThrottlerBehindProxyGuard)
    @Get('search/:search')
    async search(@Param() { search }: ReqSearchDto) {
        // throw new Error('테스트 에러');
        return await this.mainService.findByBJName(search);
    }
}
