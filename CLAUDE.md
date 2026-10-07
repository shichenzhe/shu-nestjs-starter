# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

shu-nestjs-starter——NestJS + Fastify + Prisma + TypeScript 服务端脚手架模板（从生产业务项目抽取）。

## 开发命令

```bash
# 开发调试（watch 模式）
npm run start:dev

# 构建
npm run build

# 单元测试（Jest，rootDir=test）
npm run test

# Lint
npm run lint

# Prisma
npm run prisma:generate   # 生成客户端
npm run prisma:reset      # 重建 SQLite + seed 初始 admin
npm run prisma:migrate    # 迁移（开发）
npm run prisma:deploy     # 迁移（生产）
npm run prisma:studio     # 数据库 GUI
```

启动地址：http://localhost:3000，Swagger：/api-docs，管理端点：/actuator/health、/actuator/metrics

## 代码架构

### 分层

- **src/commons/** - 通用层（与业务无关，新项目直接复用）
  - `auth/` - JWT+Basic 双认证：strategy / guard / decorator（`@Public` `@JwtAuth` `@Roles` `@AccessContext`）/ JwtAuthService
  - `config/` - config.yml 加载（configuration.ts）与各段配置实体
  - `database/` - PrismaModule/PrismaService
  - `log/` - Winston 按日轮转日志工厂
  - `web/` - ResponseInterceptor（统一包装）、HttpExceptionFilter、请求日志/JSON 序列化拦截器、management/（health + metrics）
  - `query/` - QueryFilter/QueryResult 通用列表查询
  - `entity/` - StandardEntity（审计字段）、OperateContext/Operator
  - `exception/` - BusinessException + ErrorCode 枚举与工厂
- **src/modules/** - 业务模块（参考 user 模块结构）：
  `xxx.controller.ts` + `xxx.service.ts` + `xxx.repository.ts` + `entity/`（库表实体 + querydecoder + queryfilter）+ `dto/`
- **src/config/config.yml** - 全部运行配置

### 请求流

Fastify → RequestLogger → JwtAuthGuard/RolesGuard → ValidationPipe → Controller → Service（抛 BusinessException）→ ResponseInterceptor 包装 `{code, message, data}` → HttpExceptionFilter 兜底

### 路由约定

- 全部 POST 风格业务接口（create/query/getById/update/delete）
- 需登录：`@UseGuards(JwtAuthGuard)`；限角色：`@Roles(UserType.admin)` + RolesGuard
- 免登录接口：`@Public()`
- 获取当前操作者：`@AccessContext() operateContext: OperateContext`

### 数据库

- Prisma ORM，默认 SQLite（`prisma/local.db`），PostgreSQL 变体 `prisma/schema.prisma.postgresql`
- 不使用外键（`relationMode = "prisma"`），关联在 service 层维护
- 主要表：`user`、`operation_log`、`option`
- 枚举 `UserType`：`admin` / `user`

## 开发规范

- 文件名 `kebab-case`；变量/函数 camelCase；类 PascalCase
- Prettier：单引号、tabWidth=2、printWidth=80、分号、trailingComma=all
- 业务错误一律抛 `BusinessException` + `ErrorCode`（见 commons/exception），不要裸抛 HttpException
- 列表查询继承 QueryFilter，配 querydecoder 转换为 Prisma where
- 新表实体继承 StandardEntity（含审计字段 creator/updator/时间戳）

## 脚手架专有

本仓库是脚手架模板，源码中内置 4 个占位符，由 `npm run init` 交互式替换（幂等，可重复运行，记录写入 `shu-init.json`，已 gitignore）：

- `{{APP_NAME}}` - 应用名（package.json `name`、config.yml `app.name`、Swagger 标题、prometheus tag）
- `{{JWT_SECRET}}` - JWT 签名密钥（留空自动生成随机值）
- `{{AUTHOR}}` - 作者（package.json、LICENSE）
- `{{REPO_URL}}` - 仓库地址（留空则移除 repository 字段）

未 init 也能 `npm run start:dev`（占位符是合法配置值），但启动日志会告警 JWT 密钥为默认值。生产部署前**必须** init。
