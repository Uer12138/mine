# 部署说明

## 本地开发环境

### 1. 克隆项目
\`\`\`bash
git clone <repository-url>
cd TeaCal-website
\`\`\`

### 2. 安装依赖
\`\`\`bash
pnpm install
\`\`\`

### 3. 配置环境变量
创建 `.env.local` 文件：
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

### 4. 初始化数据库
1. 登录 Supabase 控制台
2. 进入 SQL 编辑器
3. 执行 `scripts/create-tea-calorie-system.sql` 文件内容

### 5. 启动开发服务器
\`\`\`bash
pnpm dev
\`\`\`

## 生产环境部署

### Vercel 部署

1. **准备项目**
   - 确保代码已推送到 Git 仓库
   - 确保 `package.json` 中的构建脚本正确

2. **连接 Vercel**
   - 登录 Vercel 账户
   - 导入 Git 仓库
   - 配置环境变量

3. **环境变量配置**
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   \`\`\`

4. **部署**
   - Vercel 自动检测 Next.js 项目
   - 自动构建��部署

### 其他平台部署

#### Netlify
1. 连接 Git 仓库
2. 构建命令：`npm run build`
3. 发布目录：`.next`
4. 配置环境变量

#### Railway
1. 连接 Git 仓库
2. 自动检测 Next.js 项目
3. 配置环境变量
4. 自动部署

## 数据库配置

### Supabase 设置

1. **创建项目**
   - 登录 Supabase
   - 创建新项目
   - 等待项目初始化完成

2. **获取连接信息**
   - 项目设置 → API
   - 复制 Project URL 和 anon public key

3. **执行数据库脚本**
   \`\`\`sql
   -- 在 SQL 编辑器中执行 scripts/create-tea-calorie-system.sql
   \`\`\`

4. **配置权限**（可选）
   - 在 Demo 模式下已禁用 RLS
   - 生产环境建议启用 RLS 并配置适当的策略

## 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

## 构建和测试

### 构建项目
\`\`\`bash
pnpm build
\`\`\`

### 运行测试
\`\`\`bash
pnpm test
\`\`\`

### 代码检查
\`\`\`bash
pnpm lint
\`\`\`

## 性能优化

### 1. 数据库优化
- 为常用查询字段创建索引
- 优化查询语句
- 使用连接池

### 2. 前端优化
- 启用 Next.js 图片优化
- 使用动态导入减少包大小
- 启用缓存策略

### 3. 监控
- 配置错误监控
- 性能监控
- 用户行为分析

## 安全考虑

### 1. 生产环境安全
- 启用 Supabase RLS
- 使用更强的密码加密算法
- 配置 CORS 策略
- 启用 HTTPS

### 2. 数据备份
- 定期备份数据库
- 配置自动备份策略
- 测试恢复流程

## 故障排除

### 常见部署问题

1. **构建失败**
   - 检查 Node.js 版本兼容性
   - 确认所有依赖已安装
   - 检查环境变量配置

2. **��据库连接失败**
   - 验证 Supabase 项目状态
   - 检查环境变量是否正确
   - 确认网络连接

3. **功能异常**
   - 检查浏览器控制台错误
   - 验证数据库表结构
   - 确认用户权限设置

## 维护指南

### 1. 定期更新
- 更新依赖包
- 更新 Next.js 版本
- 更新 Supabase 客户端

### 2. 监控和维护
- 监控应用性能
- 检查错误日志
- 定期安全审计

### 3. 备份策略
- 数据库定期备份
- 代码版本控制
- 配置文件备份
