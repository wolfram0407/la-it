import {Controller, Get} from '@nestjs/common';
import {HealthCheck, HealthCheckService, HttpHealthIndicator, MongooseHealthIndicator, TypeOrmHealthIndicator} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private mongDb: MongooseHealthIndicator,
    private http: HttpHealthIndicator,


  ) {}

  @Get('typeorm')
  @HealthCheck()
  typeOrmCheck() {
    return this.health.check([
      () => this.db.pingCheck('database')
    ])
  }

  @Get('mongodb')
  @HealthCheck()
  mongoDbCheck() {
    return this.health.check([
      () => this.mongDb.pingCheck('database')
    ])
  }

  @Get()
  @HealthCheck()
  httpCheck() {
    return this.health.check([
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
    ])
  }
}
