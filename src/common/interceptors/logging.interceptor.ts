import {CallHandler,ExecutionContext,Injectable,NestInterceptor,} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Logger } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const startedAt = Date.now();
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startedAt;
        this.logger.log(`${method} ${url} - ${duration}ms`);
      }),
    );
  }
}
