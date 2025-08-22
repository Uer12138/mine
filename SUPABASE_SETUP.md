# Supabase 配置说明

## 问题描述
如果你遇到注册后无法登录的问题，可能是因为 Supabase 配置缺失导致的。

## 解决方案

### 方案1：配置 Supabase（推荐）

#### 1. 创建 Supabase 项目
1. 访问 [Supabase](https://supabase.com) 并注册账户
2. 创建新项目
3. 等待项目初始化完成

#### 2. 获取项目配置信息
在 Supabase 项目仪表板中：
1. 进入 Settings > API
2. 复制以下信息：
   - Project URL
   - anon public key
   - service_role key (用于服务端操作)

#### 3. 配置环境变量
在项目根目录的 `.env.local` 文件中，取消注释并填入以下配置：
```bash
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
SUPABASE_SERVICE_ROLE_KEY=你的服务端密钥
```

#### 4. 创建数据库表
在 Supabase 项目的 SQL Editor 中，依次执行以下 SQL 脚本：
1. `scripts/create-tea-calorie-system.sql` - 创建基础表结构
2. `scripts/create-tea-database.sql` - 创建奶茶产品表和数据
3. `scripts/initialize-tea-calorie-data.sql` - 初始化基础数据\`\`\`

### 方案2：使用本地存储模式（临时）
如果暂时不想配置 Supabase，系统会自动使用 localStorage 模式：
- 用户数据存储在浏览器本地
- 不需要数据库配置
- 适合开发和测试

## 当前状态检查
打开浏览器开发者工具的控制台，查看是否有以下日志：
- "注册成功: {username, passwordHash, userId}"
- "登录尝试: {username, passwordHash}"
- "存储的用户: [...]"

## 故障排除
如果仍然无法登录：
1. 清除浏览器本地存储：`localStorage.clear()`
2. 重新注册用户
3. 检查控制台错误信息

## 注意事项
- 本地存储模式的数据只存在于当前浏览器
- 清除浏览器数据会导致用户信息丢失
- 生产环境建议使用 Supabase 数据库
