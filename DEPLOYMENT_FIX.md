# 部署问题修复指南

## 问题描述

在部署的网站中遇到以下问题：
1. 新用户注册时，Supabase数据库没有更新数据
2. 热量查询页面的用户选择无法同步到记录中

## 问题原因

### 1. 环境变量未配置
部署环境缺少必要的Supabase环境变量，导致应用无法连接到数据库。

### 2. 热量计算器缺少保存功能
原始的热量计算器页面只提供计算功能，没有保存到记录的选项。

## 解决方案

### 步骤1：配置Supabase环境变量

#### 在Vercel部署平台设置环境变量：

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的Tea-Cal项目
3. 进入 **Settings** → **Environment Variables**
4. 添加以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
```

#### 获取Supabase配置信息：

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** → **API**
4. 复制以下信息：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 在其他部署平台设置环境变量：

**Netlify:**
1. 进入项目设置 → Environment variables
2. 添加上述环境变量

**Railway:**
1. 进入项目 → Variables
2. 添加上述环境变量

**Heroku:**
1. 进入应用设置 → Config Vars
2. 添加上述环境变量

### 步骤2：确保数据库表结构正确

在Supabase SQL编辑器中执行以下脚本（按顺序）：

```sql
-- 1. 执行基础表结构
-- 文件: scripts/create-tea-calorie-system.sql

-- 2. 修复users表结构
-- 文件: fix-users-table-complete.sql

-- 3. 修复tea_records表结构
-- 文件: scripts/fix-tea-records-table.sql
```

### 步骤3：重新部署应用

设置环境变量后，需要重新部署应用：

**Vercel:**
- 在项目页面点击 **Redeploy** 按钮
- 或者推送新的代码到Git仓库触发自动部署

**其他平台:**
- 按照各平台的重新部署流程操作

## 新增功能

### 热量计算器保存功能

现在热量计算器页面新增了以下功能：

1. **总热量显示卡片**：当选择奶茶后，会显示包含总热量的汇总卡片
2. **保存到记录按钮**：用户可以直接将当前选择保存到我的记录中
3. **保存状态反馈**：显示保存进度和结果消息

### 使用方法：

1. 在热量计算器页面选择奶茶
2. 添加所需配料
3. 查看总热量计算结果
4. 点击"保存到记录"按钮
5. 系统会自动保存到用户记录中

## 验证修复结果

### 1. 测试用户注册

1. 访问部署的网站
2. 尝试注册新用户
3. 检查Supabase数据库中的users表是否有新记录

### 2. 测试热量计算器保存

1. 登录应用
2. 进入热量计算器页面
3. 选择奶茶和配料
4. 点击"保存到记录"按钮
5. 进入"我的记录"页面验证是否保存成功

### 3. 运行诊断脚本

在本地环境运行诊断脚本验证配置：

```bash
node diagnose-deployment-issues.js
```

如果所有测试通过，说明修复成功。

## 常见问题

### Q: 设置环境变量后仍然无法连接数据库
**A:** 
1. 确认环境变量值正确（没有多余空格）
2. 确认已重新部署应用
3. 检查Supabase项目是否暂停（免费计划有使用限制）

### Q: 用户注册成功但数据库没有记录
**A:**
1. 检查RLS（行级安全）策略是否正确配置
2. 确认users表结构包含所有必要字段
3. 查看浏览器控制台是否有错误信息

### Q: 热量计算器保存按钮不显示
**A:**
1. 确认已选择奶茶（必须先选择奶茶才会显示保存选项）
2. 检查浏览器控制台是否有JavaScript错误

## 技术支持

如果按照上述步骤操作后仍有问题，请：

1. 检查浏览器开发者工具的控制台错误
2. 查看Supabase项目的日志
3. 运行本地诊断脚本获取详细错误信息
4. 提供具体的错误信息以便进一步排查