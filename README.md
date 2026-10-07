# 枢 · shu-nestjs-starter

> 枢者，门轴也——门之开合，皆系于枢。一切服务端应用，由此开启。

开箱即用的 **NestJS + Fastify + Prisma** 服务端脚手架：登录认证、统一响应、
接口文档、监控指标、操作日志，一个模板全都有。与桌面端模板
[shu-electron-starter](../shu-electron-starter) 同源同规范，组成"枢"双件套。

## 特性

- **登录认证**：JWT 访问/刷新双令牌 + Basic 认证 + 角色守卫（`@Roles`）
- **统一 Web 层**：响应包装、业务异常 + 错误码、请求日志（trace_id 贯穿）、JSON 序列化拦截
- **接口文档**：Swagger UI 开箱即用（`/api-docs`），JWT/Bearer 调试直接可用
- **管理端点**：actuator 风格 `/actuator/health`（磁盘/内存检查）与 `/actuator/metrics`（prometheus 指标）
- **通用查询**：query-filter 声明式列表过滤（分页/关键字/字段过滤）
- **数据库**：Prisma + SQLite 默认（零依赖启动），附 PostgreSQL 切换支持
- **操作日志**：拦截器自动记录接口调用（用户/IP/耗时/状态）
- **日志**：Winston 按日轮转，trace_id 关联请求
- **部署**：多阶段 Dockerfile、优雅关闭、gzip 压缩

## 技术栈

NestJS 11 · Fastify 5 · TypeScript · Prisma + SQLite/PostgreSQL ·
class-validator · passport-jwt · Swagger · Winston · prom-client · Jest

## 快速开始

```bash
# 1. 用本模板创建仓库（GitHub "Use this template" 或）
npx degit <your-fork>/shu-nestjs-starter my-service
cd my-service

# 2. 安装依赖（package.json name 为占位符时的警告无害）
npm install

# 3. 初始化（应用名 / JWT 密钥 / 作者 / 仓库地址，可重复运行）
npm run init

# 4. 建库并写入初始 admin 账号（admin / 123456）
npm run prisma:reset

# 5. 启动开发
npm run start:dev
```

启动后：

- Swagger 文档：http://localhost:3000/api-docs
- 健康检查：http://localhost:3000/actuator/health
- Prometheus 指标：http://localhost:3000/actuator/metrics
- 登录：`POST /auth/login`（`{"username":"admin","password":"123456"}`）

**添加你的第一个业务模块** → [docs/guide.md](docs/guide.md)

## 目录结构

```
├── prisma/            # schema（sqlite 默认 + postgresql 变体）与 seed
├── scripts/init.mjs   # 交互式初始化（占位符替换）
├── src/
│   ├── commons/       # 通用层：auth / config / database / log / web / query / entity / exception
│   ├── config/        # config.yml 应用配置（端口/数据库/日志/监控/认证）
│   └── modules/       # 业务模块：controller + service + repository + entity + dto
└── test/              # Jest 单测
```

## 切换 PostgreSQL

1. `cp prisma/schema.prisma.postgresql prisma/schema.prisma`
2. 设置 `DATABASE_URL` 环境变量为 postgres 连接串（如 `export DATABASE_URL="postgresql://user:pass@host:5432/db"`，或写入 `.env` 文件）
3. `npx prisma generate && npm run prisma:deploy`

## 配置

全部配置集中在 `src/config/config.yml`：端口、contextPath、压缩、数据库、
监控（health/metrics）、Swagger、日志、认证（JWT/Basic）。改动后重启生效。

## 安全说明（Security Notes）

- **执行 `npm run init` 是生产部署的硬性前置**：模板默认 JWT 密钥所有人相同，
  未替换即上线的服务可被任意伪造令牌（启动时会有告警日志）。
- **seed 初始账号 admin/123456 仅用于开发**，上线前必须修改。
- 生产环境建议在 config.yml 关闭 Swagger（`swagger.enabled: false`）。

## License

[MIT](LICENSE)
