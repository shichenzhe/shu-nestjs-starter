import { Module } from '@nestjs/common';
import { PrismaModule } from './commons/database/prisma.module';
import { ClsModule } from 'nestjs-cls';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './commons/auth/auth.module';
import { AuthModule as AuthControllerModule } from './modules/auth/auth.module';
import { OptionService } from './modules/option/option.service';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ResponseInterceptor } from './commons/web/interceptor/response.interceptor';
import { HttpExceptionFilter } from './commons/web/filter/http-exception.filter';
import { ConfigModule } from '@nestjs/config';
import configuration from './commons/config/configuration';
import { RequestLoggerInterceptor } from './commons/web/interceptor/request-logger.interceptor';
import { LogModule } from './commons/log/log.module';
import { v4 as uuidv4 } from 'uuid';
import { FastifyRequest } from 'fastify';
import { JsonSerializerInterceptor } from './commons/web/interceptor/json-serializer.interceptor';
import { OperationLogInterceptor } from './modules/operationlog/operation-log.interceptor';
import { HealthModule } from './commons/web/management/health/health.module';
import { MetricsModule } from './commons/web/management/metrics/metrics.module';
import { MetricsInterceptor } from './commons/web/management/metrics/metrics.interceptor';
import { OperationLogModule } from './modules/operationlog/operation-log.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration], //加载配置文件
    }) as any,
    ClsModule.forRoot({
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req: FastifyRequest) => {
          return (req.headers['trace_id'] as string) || uuidv4();
        },
      },
    }),
    LogModule,
    UserModule,
    AuthModule.forRoot({ global: true }),
    AuthControllerModule,
    HealthModule,
    MetricsModule.forRoot(),
    PrismaModule,
    OperationLogModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: RequestLoggerInterceptor }, // 应用请求日志拦截器。
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor }, // 应用响应拦截器。
    { provide: APP_INTERCEPTOR, useClass: JsonSerializerInterceptor },
    { provide: APP_INTERCEPTOR, useClass: OperationLogInterceptor }, // 应用操作日志拦截器。
    { provide: APP_INTERCEPTOR, useClass: MetricsInterceptor }, // 应用性能指标拦截器。
    { provide: APP_FILTER, useClass: HttpExceptionFilter }, // 应用异常响应过滤器。
    OptionService,
  ],
})
export class AppModule {}
