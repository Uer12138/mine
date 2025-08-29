-- =====================================================================================
-- 快速修复 is_active 列缺失问题
-- =====================================================================================
-- 此脚本专门用于修复 "column 'is_active' does not exist" 错误
-- 请在 Supabase Dashboard 的 SQL Editor 中执行此脚本
-- =====================================================================================

-- 直接添加 is_active 列到 users 表
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- 验证列是否添加成功
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN
        RAISE NOTICE '✅ is_active 列添加成功！';
    ELSE
        RAISE NOTICE '❌ is_active 列添加失败！';
    END IF;
END $$;

-- 显示当前 users 表的所有列
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;