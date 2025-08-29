# Supabase 数据库设置指南

本指南将帮助您将奶茶热量计算应用的用户数据同步到 Supabase 数据库中。

## 📋 概述

新的数据库架构支持以下功能：
- 用户注册和登录管理
- 个人资料和偏好设置
- 奶茶记录的云端存储
- 健康目标跟踪
- 智能推荐系统
- 用户反馈和评价系统
- 详细的统计分析

## 🚀 快速开始

### 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并创建账户
2. 创建新项目
3. 记录项目的 URL 和 API Key

### 2. 执行数据库脚本

按以下顺序在 Supabase SQL 编辑器中执行脚本：

```sql
-- 1. 首先执行基础表结构
-- 执行 scripts/create-tea-calorie-system.sql

-- 2. 然后执行产品数据表
-- 执行 scripts/create-tea-database.sql

-- 3. 执行用户数据同步增强
-- 执行 scripts/create-user-data-sync.sql

-- 4. 最后执行初始化配置
-- 执行 scripts/initialize-supabase-database.sql
```

### 3. 配置环境变量

在项目根目录创建 `.env.local` 文件：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 应用配置
NEXT_PUBLIC_APP_MODE=supabase
```

### 4. 更新应用代码

在需要使用数据库功能的组件中导入新的同步函数：

```typescript
import {
  getUserProfile,
  updateUserProfile,
  addTeaRecord,
  getUserTeaRecords,
  migrateTeaRecordsFromLocalStorage
} from '@/lib/user-data-sync'
```

## 📊 数据库架构

### 核心表结构

#### 1. users (用户表)
- 存储用户基本信息、偏好设置
- 支持体重、身高、年龄等健康数据
- 记录登录统计和账户状态

#### 2. tea_records (奶茶记录表)
- 用户的所有奶茶消费记录
- 包含热量、糖分、咖啡因等营养信息
- 支持心情、笔记、评分等个性化数据

#### 3. user_preferences (用户偏好表)
- 灵活的键值对存储用户偏好
- 支持复杂的偏好设置

#### 4. health_goals (健康目标表)
- 用户设定的各类健康目标
- 自动跟踪目标完成情况

#### 5. daily_stats (每日统计表)
- 自动计算的每日消费统计
- 通过触发器实时更新

### 增强功能表

#### 6. user_favorites (用户收藏)
- 收藏的奶茶产品
- 支持自定义修改和备注

#### 7. recommendation_history (推荐历史)
- 记录所有推荐结果
- 跟踪推荐效果

#### 8. user_feedback (用户反馈)
- 用户意见和建议
- 支持分类管理

#### 9. product_reviews (产品评价)
- 用户对奶茶产品的评价
- 支持多维度评分

## 🔧 主要功能使用

### 用户注册和登录

```typescript
// 注册新用户
const result = await registerUser({
  username: 'user123',
  password: 'securepassword',
  weight: 65,
  height: 170,
  age: 25
})

// 用户登录
const loginResult = await loginUser('user123', 'securepassword')

// 记录登录
if (loginResult.success) {
  await recordUserLogin(loginResult.user.id, ipAddress, userAgent)
}
```

### 奶茶记录管理

```typescript
// 添加奶茶记录
const record = await addTeaRecord({
  user_id: userId,
  tea_name: '珍珠奶茶',
  size: 'L',
  sweetness_level: '半糖',
  toppings: '珍珠',
  estimated_calories: 450,
  mood: '开心',
  notes: '今天心情不错'
})

// 获取用户记录
const records = await getUserTeaRecords(userId, 20, 0)

// 更新记录
const updated = await updateTeaRecord(recordId, userId, {
  rating: 5,
  would_order_again: true
})
```

### 健康目标管理

```typescript
// 创建健康目标
const goal = await createHealthGoal({
  user_id: userId,
  goal_type: 'daily_calories',
  target_value: 500,
  start_date: '2024-01-01'
})

// 更新目标进度
const progress = await updateHealthGoalProgress(goalId, userId, 350)

// 获取用户目标
const goals = await getUserHealthGoals(userId, true)
```

### 数据迁移

```typescript
// 从 localStorage 迁移数据
const migration = await migrateTeaRecordsFromLocalStorage(userId)
console.log(`迁移了 ${migration.migratedCount} 条记录`)

// 同步用户偏好
const preferences = {
  theme: 'dark',
  notifications: true,
  language: 'zh-CN'
}
const sync = await syncUserPreferencesToSupabase(userId, preferences)
```

## 📈 统计和分析

### 获取用户统计

```typescript
// 获取每日统计
const dailyStats = await getUserDailyStats(userId, '2024-01-01', '2024-01-31')

// 获取月度统计
const monthlyStats = await getUserMonthlyStats(userId)

// 使用数据库函数获取健康摘要
const { data } = await supabase
  .rpc('get_user_health_summary', {
    p_user_id: userId,
    p_days: 30
  })
```

### 智能推荐

```typescript
// 获取个性化推荐
const { data: recommendations } = await supabase
  .rpc('get_user_recommendations', {
    p_user_id: userId,
    p_limit: 10
  })

// 记录推荐历史
const recordRec = await recordRecommendation({
  user_id: userId,
  tea_product_id: productId,
  recommendation_type: 'personalized',
  recommendation_reason: '基于您的偏好'
})
```

## 🔒 安全性

### 行级安全策略 (RLS)

所有用户数据表都启用了 RLS，确保：
- 用户只能访问自己的数据
- 系统可以管理必要的统计和推荐
- 公共数据（如产品信息）对所有人可见

### 数据验证

```typescript
// 所有函数都包含错误处理
const result = await addTeaRecord(recordData)
if (!result.success) {
  console.error('添加记录失败:', result.error)
  // 处理错误
}
```

## 🚀 性能优化

### 索引优化
- 为常用查询字段创建了索引
- 支持全文搜索的 GIN 索引
- 复合索引优化多条件查询

### 自动触发器
- 自动更新 `updated_at` 字段
- 实时计算每日统计
- 自动检查健康目标完成状态

### 视图优化
- `user_stats_overview`: 用户统计概览
- `popular_tea_products`: 热门产品排行
- `user_monthly_stats`: 月度统计汇总

## 🔄 数据迁移策略

### 从 localStorage 迁移

1. **保留现有数据**：迁移过程不会删除 localStorage 数据
2. **增量同步**：支持多次迁移，避免重复数据
3. **数据验证**：迁移前验证数据格式和完整性

### 渐进式迁移

```typescript
// 检查用户是否已迁移
const hasCloudData = await getUserTeaRecords(userId, 1, 0)
if (hasCloudData.data?.length === 0) {
  // 执行迁移
  await migrateTeaRecordsFromLocalStorage(userId)
}
```

## 🛠️ 故障排除

### 常见问题

1. **连接失败**
   - 检查环境变量配置
   - 验证 Supabase URL 和 API Key

2. **权限错误**
   - 确认 RLS 策略正确配置
   - 检查用户认证状态

3. **数据不同步**
   - 检查网络连接
   - 验证数据格式
   - 查看浏览器控制台错误

### 调试工具

```typescript
// 启用详细日志
const result = await addTeaRecord(data)
console.log('操作结果:', result)

// 检查用户状态
const profile = await getUserProfile(userId)
console.log('用户资料:', profile)
```

## 📚 API 参考

详细的 API 文档请参考 `lib/user-data-sync.ts` 文件中的函数注释。

### 主要函数分类

- **用户管理**: `getUserProfile`, `updateUserProfile`, `recordUserLogin`
- **偏好设置**: `getUserPreferences`, `setUserPreference`
- **记录管理**: `addTeaRecord`, `getUserTeaRecords`, `updateTeaRecord`, `deleteTeaRecord`
- **统计分析**: `getUserDailyStats`, `getUserMonthlyStats`
- **健康目标**: `getUserHealthGoals`, `createHealthGoal`, `updateHealthGoalProgress`
- **收藏推荐**: `addFavoriteTeaProduct`, `getUserFavoriteTeaProducts`, `recordRecommendation`
- **反馈评价**: `submitUserFeedback`, `submitProductReview`, `getProductReviews`
- **数据迁移**: `migrateTeaRecordsFromLocalStorage`, `syncUserPreferencesToSupabase`

## 🎯 下一步计划

1. **实时同步**: 实现数据的实时双向同步
2. **离线支持**: 支持离线模式和数据缓存
3. **高级分析**: 更复杂的数据分析和可视化
4. **社交功能**: 用户间的分享和互动功能
5. **AI 推荐**: 基于机器学习的智能推荐算法

---

如有任何问题，请查看项目文档或提交 Issue。