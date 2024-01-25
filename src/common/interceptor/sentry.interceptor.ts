import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, catchError } from "rxjs";
import { Request as ExpressRequest } from 'express'
import * as Sentry from '@sentry/node';
import { IncomingWebhook } from "@slack/webhook";
@Injectable()
export class SentryInterceptor implements NestInterceptor
{
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>>
  {
    const http = context.switchToHttp();
    const request = http.getRequest<ExpressRequest>();
    const { url } = request

    return next.handle().pipe(
      catchError((error) =>
      {
        Sentry.captureException(error)
        const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK)
        webhook.send({
          attachments: [
            {
              text: 'La-iT 에러',
              fields: [
                {
                  title: `Error Message : ${error.response?.message}||${error.message}`,
                  value: `URL : ${url}\n${error.stack}`,
                  short: false,
                }
              ],
              ts: Math.floor(new Date().getTime() / 1000).toString(),
            }
          ]
        })
        throw error;
      })
    )
  }
}