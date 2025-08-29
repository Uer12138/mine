-- =====================================================================================
-- 修复 users 表结构 - 添加缺失字段
-- =====================================================================================
-- 此脚本用于修复集成测试中发现的 users 表字段缺失问题
-- 请在 Supabase Dashboard 的 SQL Editor 中执行此脚本
-- =====================================================================================

-- 添加缺失的字段到 users 表
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS disliked_ingredients TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS health_goals TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_calorie_limit INTEGER DEFAULT 2000;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_gender ON users(gender);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_profile_completed ON users(profile_completed);

-- 更新现有用户的默认值
UPDATE users SET login_count = 0 WHERE login_count IS NULL;
UPDATE users SET is_active = TRUE WHERE is_active IS NULL;
UPDATE users SET profile_completed = FALSE WHERE profile_completed IS NULL;
UPDATE users SET daily_calorie_limit = 2000 WHERE daily_calorie_limit IS NULL;

-- 验证表结构
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 显示成功消息
DO $$
BEGIN
    RAISE NOTICE '✅ users 表结构修复完成！';
    RAISE NOTICE '📋 已添加的字段:';
    RAISE NOTICE '   - gender: 性别';
    RAISE NOTICE '   - disliked_ingredients: 不喜欢的配料';
    RAISE NOTICE '   - health_goals: 健康目标';
    RAISE NOTICE '   - daily_calorie_limit: 每日卡路里限制';
    RAISE NOTICE '   - last_login: 最后登录时间';
    RAISE NOTICE '   - login_count: 登录次数';
    RAISE NOTICE '   - is_active: 账户状态';
    RAISE NOTICE '   - profile_completed: 资料完整性';
END $$;