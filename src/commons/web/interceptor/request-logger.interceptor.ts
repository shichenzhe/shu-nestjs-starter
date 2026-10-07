import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { FastifyRequest, FastifyReply } from 'fastify';
import { Logger } from 'src/commons/log/logger';
import { LoggerFactory } from 'src/commons/log/logger-factory';
import IPUtil from '../util/ip.util';
import { BusinessException } from 'src/commons/exception/bussiness-exception';

/**
 * 请求日志拦截器
 * 记录所有controller请求的详细信息
 */
@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  private readonly logger: Logger;

  constructor(private readonly factory: LoggerFactory) {
    this.logger = this.factory.create('RequestLoggerInterceptor');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const response = context.switchToHttp().getResponse<FastifyReply>();
    const startTime = Date.now();
    const requestTime = new Date().toISOString();

    // 获取请求基本信息
    const requestInfo = this.extractRequestInfo(request);
    requestInfo['requestTime'] = requestTime;
    this.logger.info(JSON.stringify(requestInfo));

    return next.handle().pipe(
      tap((responseData: any) => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        this.logger.info(
          JSON.stringify({
            status: response.statusCode,
            responseTime: new Date().toISOString(),
            duration,
            response: this.sanitizeResponseData(responseData),
          }),
        );
      }),
      catchError((error: any) => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        this.logger.error(
          JSON.stringify({
            status: response.statusCode,
            responseTime: new Date().toISOString(),
            duration,
            error:
              error instanceof BusinessException
                ? error.toJSON()
                : String(error),
          }),
        );

        return throwError(() => error as HttpException | BusinessException);
      }),
    );
  }

  /**
   * 提取请求信息
   */
  private extractRequestInfo(request: FastifyRequest) {
    const method = request.method;
    // 获取子路径
    const url = request.url;
    const queryParams = request.query;
    const body = request.body;
    const headers = this.extractHeaders(request.headers);
    const clientIp = IPUtil.getClientIP(request);
    const userAgent = request.headers['user-agent'];

    return {
      method,
      url,
      queryParams,
      body,
      headers,
      clientIp,
      userAgent,
    };
  }

  private extractHeaders(
    headers: FastifyRequest['headers'],
  ): Record<string, string | string[] | undefined> {
    const sensitiveHeaders = [
      'content-length',
      'cookie',
      'sec-ch-ua',
      'sec-ch-ua-mobile',
      'accept',
      'accept-encoding',
      'accept-language',
      'origin',
      'referer',
      'sec-ch-ua-platform',
      'sec-fetch-site',
      'sec-fetch-mode',
      'sec-fetch-dest',
      'connection',
      'pragma',
      'cache-control',
      'user-agent',
      'request-origion',
    ];
    const sanitized: Record<string, string | string[] | undefined> = {
      ...headers,
    };

    sensitiveHeaders.forEach((header) => {
      if (sanitized[header]) {
        delete sanitized[header];
      }
    });

    return sanitized;
  }

  /**
   * 清理响应数据
   */
  private sanitizeResponseData(data: any): string {
    if (!data) return 'null';

    const dataString = JSON.stringify(data);
    // 限制响应数据大小最大输出4096个字符，避免日志过大
    return dataString.length > 4096
      ? dataString.substring(0, 4096)
      : dataString;
  }
}
