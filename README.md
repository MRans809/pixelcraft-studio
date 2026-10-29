# PixelCraft 素材制作工作台

PixelCraft 是一个可独立运行的模拟素材制作网站。用户可以浏览模板、上传图片并提交制作任务；Java 后端会依次执行“素材检查 → 模拟生成 → 结果整理”，把阶段、状态、失败原因和结果持久化到 MySQL。关闭制作页不会中断任务，刷新历史页后可以恢复记录并继续查询未完成任务。

本项目不调用真实 AI 服务。所有封面为仓库内原创 SVG 示例素材，成功结果使用用户上传的第一张图片模拟。

## 快速启动

前置条件：Docker Engine 24+，Docker Compose v2。

```bash
cp .env.example .env
docker compose up --build
```

Windows PowerShell 可执行：

```powershell
Copy-Item .env.example .env
docker compose up --build
```

服务启动后访问：

- 前端：<http://localhost:3000>
- 后端健康检查：<http://localhost:3000/api/templates>
- MySQL：仅在 Compose 内部网络开放，不映射宿主机端口

停止服务：

```bash
docker compose down
```

清除数据库、上传文件并重新初始化：

```bash
docker compose down -v
docker compose up --build
```

`down -v` 会删除本项目 Compose 卷中的数据库和上传素材，仅应在确认不需要保留演示数据时使用。

## 技术版本

| 层次 | 技术与版本 |
| --- | --- |
| 前端 | Next.js 16.4.3、React 19.3.1、TypeScript 5.8.2、ESLint 9.39.5 |
| 前端测试 | Vitest 4.1.12、Testing Library 16.2.0 |
| 后端 | Java 21、Spring Boot 3.4.4、MyBatis Spring Boot Starter 3.0.4 |
| 数据库 | MySQL 8.4 |
| 容器 | Docker Compose v2、Node 20 Alpine、Temurin 21 |
| CI | GitHub Actions：Node 20、Temurin 21 |

版本均在 `package-lock.json`、Maven `pom.xml` 和容器配置中固定或明确声明。

## 项目结构

```text
pixelcraft-studio/
├─ .github/workflows/ci.yml       # push / PR 自动检查
├─ backend/                       # Spring Boot + MyBatis
│  ├─ src/main/java/              # 接口、服务、后台步骤、Mapper
│  ├─ src/main/resources/         # 应用配置
│  └─ src/test/                   # 步骤顺序与失败中断测试
├─ frontend/                      # Next.js App Router
│  ├─ app/                        # 模板列表、详情、历史页面
│  ├─ components/                 # 上传、任务卡、身份对话框
│  ├─ lib/                        # API、类型、任务状态归约器
│  └─ public/covers/              # 本地原创模板封面
├─ database/init/                 # 表结构与初始化模板数据
├─ compose.yaml
└─ .env.example
```

## 本地构建、测试与启动

验收建议优先使用 Compose，避免在宿主机安装项目依赖。以下命令用于开发者单独调试。

### 前端

```bash
cd frontend
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run dev
```

前端默认把 `/api/*` 转发到 `http://localhost:8080`。容器内通过 `INTERNAL_API_BASE=http://backend:8080` 转发。

### 后端

```bash
mvn -B -pl backend test
mvn -B -pl backend package
java -jar backend/target/backend-1.0.0.jar
```

后端要求先准备 MySQL 并执行：

```text
database/init/001_schema.sql
database/init/002_seed.sql
```

默认连接参数：

```text
DB_URL=jdbc:mysql://localhost:3306/pixelcraft?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&useSSL=false
DB_USER=pixelcraft
DB_PASSWORD=pixelcraft_dev
```

## 配置项

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `MYSQL_DATABASE` | `pixelcraft` | Compose 创建的数据库名 |
| `MYSQL_USER` | `pixelcraft` | Compose 数据库用户 |
| `MYSQL_PASSWORD` | `pixelcraft_dev` | 演示数据库密码 |
| `MYSQL_ROOT_PASSWORD` | `root_dev_only` | Compose 初始化密码 |
| `DB_URL` | 本机 `pixelcraft` 连接串 | Spring Boot JDBC 地址 |
| `DB_USER` | `pixelcraft` | Spring Boot 数据库用户 |
| `DB_PASSWORD` | `pixelcraft_dev` | Spring Boot 数据库密码 |
| `TASK_STAGE_DELAY_MS` | `2500` | 每个后台阶段的模拟耗时，单位毫秒 |
| `UPLOAD_DIR` | `./uploads` / 容器内 `/data/uploads` | 服务端素材目录 |
| `INTERNAL_API_BASE` | `http://localhost:8080` | Next.js 服务端转发目标 |

`.env.example` 仅包含无真实凭据的本地演示值。生产或共享环境必须替换数据库密码，且不应提交 `.env`。

## 数据库与素材准备

`001_schema.sql` 创建：

- `templates`：模板及上传规则；
- `assets`：用户素材元数据和服务端文件路径；
- `creation_tasks`：任务状态、阶段、失败信息和结果地址；
- `task_assets`：任务与有序素材的关联。

`002_seed.sql` 初始化 6 个模板和 4 个分类。封面位于 `frontend/public/covers`，不依赖付费服务或外部图片地址。用户上传文件写入 Docker 命名卷 `upload-data`，浏览器临时地址不会作为服务端素材来源。

## 主要接口

所有个人接口接受 `X-User-Id`。未提供时使用 `demo-user-001`，便于直接演示。

### 模板

```http
GET /api/templates?category=生活记录
GET /api/templates/{id}
```

模板响应字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 模板标识 |
| `title` | string | 标题 |
| `category` | string | 分类 |
| `coverUrl` | string | 本地封面地址 |
| `description` | string | 模板说明 |
| `requiredImageCount` | number | 必需图片数 |
| `acceptedMimeTypes` | string[] | 允许类型 |
| `maxFileSizeBytes` | number | 单张大小上限 |

### 上传素材

```http
POST /api/assets
Content-Type: multipart/form-data
X-User-Id: demo-user-001

templateId=travel-postcard
files=<binary>
```

响应为素材数组，包含 `id`、`originalName`、`mimeType`、`sizeBytes` 和 `previewUrl`。前端检查数量、类型和大小，支持直接替换或移除任一上传位；后端会按模板规则再次校验，并按请求中的素材顺序绑定任务。

### 创建任务

```http
POST /api/tasks
Content-Type: application/json
X-User-Id: demo-user-001

{
  "templateId": "travel-postcard",
  "assetIds": ["asset-id-1", "asset-id-2"],
  "simulateFailureStage": "GENERATING"
}
```

`simulateFailureStage` 可为空，或为 `VALIDATING`、`GENERATING`、`FINALIZING`。接口完成参数检查和数据库落库后返回 HTTP 202 与任务对象，不等待制作结束。

### 查询任务与身份

```http
GET /api/tasks
GET /api/tasks/{id}
GET /api/me
```

任务字段：`id`、`templateId`、`templateTitle`、`status`、`stage`、`stageLabel`、`progress`、`failureReason`、`resultUrl`、`createdAt`、`updatedAt`。

## 任务状态与后台执行

整体状态：

- `QUEUED`：任务已落库，等待后台线程；
- `PROCESSING`：正在执行某个阶段；
- `SUCCEEDED`：所有阶段成功，结果已保存；
- `FAILED`：指定阶段失败并停止后续步骤。

阶段顺序固定为：

```text
WAITING → VALIDATING → GENERATING → FINALIZING → COMPLETED
```

`TaskProcessor` 使用 Spring `@Async` 和有界线程池执行。查询接口只读取数据库，不会驱动任务向下执行。前端以任务 ID 独立保存状态，只轮询 `QUEUED` 或 `PROCESSING` 任务；任务结束后停止对应轮询，离开页面时清理定时器和未完成回调。

查询请求失败与任务执行失败是两类状态：前者显示“状态查询暂时失败”并保留原任务状态，后者来自后端 `FAILED` 状态与 `failureReason`。

## 演示步骤

### 成功流程

1. 打开模板库，切换分类并进入任一模板。
2. 按要求上传图片，保持“演示结果”为“正常完成”。
3. 点击“开始制作”。按钮进入提交中状态，防止重复提交。
4. 页面跳转到制作记录，可观察三个阶段和进度变化。
5. 完成后显示结果预览；刷新页面，结果仍由后端恢复。

### 指定阶段失败

在模板详情的“演示结果”选择“素材检查失败”“模拟生成失败”或“结果整理失败”。任务到达该阶段后进入 `FAILED`，展示可理解的失败原因，后续阶段不会执行。

### 调整耗时

编辑 `.env`：

```text
TASK_STAGE_DELAY_MS=5000
```

然后执行 `docker compose up -d --build backend`。数值越大，越容易观察多个任务并行时的独立状态。

### 多任务与刷新恢复

连续从不同模板提交多个任务。历史页会分别轮询每个未完成任务；一个任务成功、失败或查询异常不会覆盖其他任务。处理期间刷新历史页，前端重新读取 `/api/tasks` 并继续跟踪未完成记录。

## 用户身份与个人记录

本题不要求第三方账号，因此采用可解释的演示身份：

- 浏览器请求固定携带 `X-User-Id: demo-user-001`；
- 后端所有素材和任务查询都按 `user_id` 过滤；
- 素材内容接口也校验所有权，避免通过 ID 读取其他用户文件；
- 顶部头像打开个人资料对话框，可查看当前用户标识和身份策略。

演示另一个用户时，可使用 API 客户端把 `X-User-Id` 改为其他值。生产方案应由认证中间件从可信会话或令牌解析用户，不应接受客户端任意声明的用户 ID。

## 自动化测试与 CI

后端 `TaskProcessorTest` 验证：

- 三个阶段严格按顺序执行后才写入成功；
- 三个可指定阶段中的任一阶段失败后立即中断，既不执行后续阶段，也不写入成功。

后端 `TaskServiceTest` 还验证多图素材即使由数据库乱序返回，也会按用户提交顺序绑定到任务上传位。

前端 `task-state.test.ts` 验证：

- 更新任务 A 不会修改任务 B 的状态或进度；
- 查询异常保存在 `queryErrors`，不会把处理中的任务改为 `FAILED`；后台失败原因仍独立保留。

`.github/workflows/ci.yml` 在每次 push 和 pull request 时执行：

- 前端 ESLint；
- TypeScript 类型检查；
- 前端单元测试；
- Next.js 生产构建；
- Java 单元测试与 Maven 打包。

## 部署与回滚

基础部署步骤：

1. 在目标机器安装 Docker 和 Compose；
2. 复制源码，基于 `.env.example` 创建 `.env` 并替换密码；
3. 执行 `docker compose up -d --build`；
4. 通过 `/api/templates`、前端首页和一次成功任务进行冒烟验证；
5. 如需公网访问，在 Compose 前增加 HTTPS 反向代理，并限制上传大小和访问来源。

基础回滚步骤：

1. 保留 MySQL 与上传卷，不执行 `down -v`；
2. 切换到上一个已验收 Git commit 或镜像标签；
3. 执行 `docker compose up -d --build backend frontend`；
4. 验证健康检查和历史记录读取；
5. 当前版本只有向后兼容的初始化建表和种子更新。后续若引入破坏性迁移，应先备份数据库，并提供明确的降级脚本。

## 完成情况与已知限制

已完成：

- 模板分类、卡片、详情和本地示例封面；
- 多上传位、预览、直接替换、移除、类型／大小／数量校验；
- Java 异步三阶段处理、可控耗时、指定阶段失败和失败中断；
- 任务、阶段、结果、素材及个人记录持久化；
- 多任务独立轮询、完成后停止、刷新恢复和查询异常区分；
- 演示用户隔离、个人资料说明；
- 关键单元测试、CI、Dockerfile、Compose、初始化 SQL 与环境示例；
- 桌面主界面和可操作的小屏布局，键盘焦点与可理解标签。

未完成或有意不实现：

- 不调用真实 AI、支付、对象存储、第三方登录或消息队列；
- 结果生成只是业务闭环模拟，不执行真实图像合成；
- 后端进程重启后，数据库中的运行中任务仍保留，但不会自动恢复执行，可能停留在 `QUEUED` 或 `PROCESSING`；这是题目明确允许的边界；
- 未实现任务受理幂等、断点续跑、自动重试、失败任务重做和删除功能；
- 未实现跨实例任务协调，当前线程池适合单实例演示；
- 用户身份是演示策略，不是生产认证；
- 未编写端到端浏览器自动化测试，按题目要求使用聚焦的前后端单元测试。

实际投入：本项目由 AI 编程代理在一次连续开发会话中完成，工作覆盖需求拆分、界面实现、后端实现、测试、容器和文档。会话没有可靠的人工计时数据，因此不虚构小时数；可通过 Git 提交时间、变更记录和 CI 运行记录审计实际过程。

## AI 使用说明

本项目使用了 AI 编程工具，工作流如下：

1. 把需求拆分为页面交互、后台状态机、持久化、测试和交付五类验收点。
2. 先建立共享的数据契约，明确任务的整体状态、当前阶段、进度、失败原因和结果地址。
3. 分别生成后端服务、前端状态管理和 Compose 初稿，再通过类型检查、单元测试、生产构建和实际页面检查修正问题。
4. 对高风险行为编写针对性测试，不以“代码能编译”代替行为验证。
5. 最后按 README 的演示步骤复核成功、阶段失败、多任务和刷新恢复。

具体例子：实现前端轮询时，AI 先把任务状态设计为按 ID 索引的映射，而不是一个全局“当前任务”；随后增加测试，先后更新任务 A 与任务 B，并注入任务 B 的查询异常。测试要求 A 的成功不能改变 B 的处理状态，查询异常也不能变成后台失败。这样把 R-07 和 R-08 转化成了可重复验证的行为。

## 脚手架、开源代码与素材来源

- 前端使用 Next.js、React、Lucide React 和 Manrope 字体包的公开 npm 包；
- 后端使用 Spring Boot、MyBatis 和 MySQL Connector/J；
- 容器使用 Docker Hub 官方 Node、Maven、Temurin 和 MySQL 镜像；
- 应用业务代码、界面样式、初始化数据和 `public/covers` 下的 SVG 示例封面均为本项目编写，没有复制题图中的品牌素材或第三方项目业务代码；
- 参考截图仅用于理解模板列表、左右分栏制作页、历史结果和个人资料的主要布局，不复刻品牌、文案或题外功能。
