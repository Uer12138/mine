# 🧋 TeaCal - 智能奶茶卡路里计算器

一个现代化的奶茶卡路里计算和健康管理应用，帮助用户在享受美味奶茶的同时保持健康的生活方式。

## ✨ 主要功能

### 🔢 智能卡路里计算
- 精准的奶茶卡路里计算
- 支持多种杯型和配料选择
- 糖分等级智能调节
- 品牌奶茶数据库

### 📊 个人健康管理
- 个人资料管理（身高、体重、年龄）
- 每日卡路里摄入追踪
- 健康目标设定和进度监控
- 个性化推荐系统

### 🤖 AI 智能助手
- 24/7 健康咨询服务
- 个性化饮食建议
- 智能行动计划生成
- 情感支持和动机激励

### 📝 记录与分析
- 详细的饮品消费记录
- 数据可视化图表
- 消费趋势分析
- 健康报告生成

### 🎯 健康任务系统
- 阶段性健康挑战
- 任务进度追踪
- 成就系统
- 社交分享功能

## 🚀 技术栈

- **前端框架**: Next.js 14 (App Router)
- **UI 组件**: Radix UI + Tailwind CSS
- **数据库**: Supabase (PostgreSQL)
- **认证系统**: 自定义认证 + Supabase Auth
- **AI 服务**: DeepSeek API
- **状态管理**: React Hooks + Local Storage
- **类型检查**: TypeScript

## 📦 安装和运行

### 环境要求
- Node.js 18.0 或更高版本
- npm 或 pnpm 包管理器

### 快速开始

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd Tea-Cal-main
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或
   pnpm install
   ```

3. **环境配置**
   ```bash
   cp .env.example .env.local
   ```
   
   配置以下环境变量：
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   DEEPSEEK_API_KEY=your_deepseek_api_key
   ```

4. **数据库设置**
   - 在 Supabase 中执行 `scripts/create-tea-calorie-system.sql`
   - 运行 `scripts/initialize-tea-calorie-data.sql` 初始化数据

5. **启动开发服务器**
   ```bash
   npm run dev
   # 或
   pnpm dev
   ```

6. **访问应用**
   打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 📁 项目结构

```
Tea-Cal-main/
├── app/                    # Next.js App Router 页面
│   ├── api/               # API 路由
│   ├── auth/              # 认证相关页面
│   ├── calculator/        # 卡路里计算器
│   ├── dashboard/         # 仪表盘
│   ├── health-tasks/      # 健康任务
│   ├── my-records/        # 个人记录
│   └── profile/           # 个人资料
├── components/            # React 组件
│   ├── ui/               # 基础 UI 组件
│   └── *.tsx             # 业务组件
├── lib/                   # 工具库和配置
│   ├── auth.ts           # 认证逻辑
│   ├── supabase.ts       # 数据库配置
│   └── utils.ts          # 工具函数
├── public/               # 静态资源
├── scripts/              # 数据库脚本
└── styles/               # 样式文件
```

## 🔧 开发指南

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 代码规范
- 使用 Prettier 格式化代码

### 提交规范
- feat: 新功能
- fix: 修复问题
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关

### 构建和部署
```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

## 📖 使用说明

详细的使用说明请参考 [USAGE.md](./USAGE.md)

## 🔧 故障排除

常见问题和解决方案请参考 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## 🚀 部署指南

部署相关信息请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详情请参考 [LICENSE](LICENSE) 文件

## 📞 联系我们

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件至项目维护者
- 在应用内使用 AI 助手获取帮助

---

**享受健康的奶茶生活！** 🧋✨
