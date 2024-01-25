import { Inject, Injectable, Logger, LoggerService, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware
{
  constructor(@Inject(Logger) private readonly logger: LoggerService)
  {

  }


  use(request: Request, response: Response, next: NextFunction): void
  {
    const { ip, method, originalUrl: url } = request;

    response.on('close', () =>
    {
      const { statusCode } = response
      this.logger.log(`${method} - ${url} ${statusCode}  -  ${ip}`)

    })
    next();
  }
}