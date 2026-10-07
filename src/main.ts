/* eslint-disable */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import * as qs from 'qs';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { ConfigService } from '@nestjs/config';
import { AppConfig } from './commons/config/app-config.entity';
import { SwaggerConfig } from './commons/config/swagger-config.entity';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      querystringParser: (str: string) => qs.parse(str),
    }),
  );

  // 启用全局验证管道，开启transform选项以支持class-transformer
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 启用自动转换
      transformOptions: {
        enableImplicitConversion: true, // 启用隐式类型转换
      },
    }),
  );

  //加载应用配置
  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app', AppConfig.getDefault());
  //设置全局路径前缀
  app.setGlobalPrefix(appConfig.contextPath);
  // 初始化Swagger
  initSwagger(app);
  //优雅关闭应用
  gracefullShutdown(app);
  //允许跨域访问
  app.enableCors();
  //启用gzip压缩
  if (appConfig.compression?.enabled) {
    app.use(
      compression({
        threshold: appConfig.compression.threshold,
        level: appConfig.compression.level,
        memLevel: appConfig.compression.memLevel,
      }),
    );
  }
  //设置端口号
  await app.listen(appConfig.port, '0.0.0.0');
}

function initSwagger(app: NestFastifyApplication) {
  const configService = app.get(ConfigService);
  // 加载Swagger配置
  const swaggerConfig = configService.get<SwaggerConfig>(
    'swagger',
    SwaggerConfig.getDefault(),
  );

  // 根据配置决定是否启用Swagger
  if (swaggerConfig.enabled) {
    const config = new DocumentBuilder()
      .setTitle(swaggerConfig.title)
      .setDescription(swaggerConfig.description)
      .setVersion(swaggerConfig.version)
      .addBasicAuth() //添加Basic认证
      .addBearerAuth() //添加JWT认证
      .build();
    const document = SwaggerModule.createDocument(app, config);
    // 使用配置的路径设置Swagger访问地址
    SwaggerModule.setup(swaggerConfig.path.replace('/', ''), app, document);
  }
}

/**
 * 优雅关闭应用
 * @param app NestFastifyApplication 实例
 */

function gracefullShutdown(app: NestFastifyApplication) {
  const gracefulShutdown = async (signal: string) => {
    console.log(`收到 ${signal} 信号，开始优雅关闭...`);

    // 监听进程信号
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    // 监听Windows下的关闭信号
    process.on('SIGBREAK', () => gracefulShutdown('SIGBREAK'));
  };
}
bootstrap();
