-- =====================================================================================
-- 完整的 users 表结构修复脚本
-- =====================================================================================
-- 此脚本会添加所有缺失的列到 users 表
-- 请在 Supabase Dashboard 的 SQL Editor 中执行此脚本
-- =====================================================================================

-- 添加所有缺失的列
DO $$
BEGIN
    RAISE NOTICE '🔧 开始添加缺失的列到 users 表...';
    
    -- 添加 email 列
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email') THEN
        ALTER TABLE users ADD COLUMN email TEXT;
        RAISE NOTICE '✅ 添加 email 列';
    END IF;
    
    -- 添加 weight 列
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'weight') THEN
        ALTER TABLE users ADD COLUMN weight DECIMAL(5,2);
        RAISE NOTICE '✅ 添加 weight 列';
    END IF;
    
    -- 添加 height 列
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'height') THEN
        ALTER TABLE users ADD COLUMN height DECIMAL(5,2);
        RAISE NOTICE '✅ 添加 height 列';
    END IF;
    
    -- 添加 age 列
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'age') THEN
        ALTER TABLE users ADD COLUMN age INTEGER;
        RAISE NOTICE '✅ 添加 age 列';
    END IF;
    
    -- 添加 gender 列
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'gender') THEN
        ALTER TABLE users ADD COLUMN gender TEXT;
        RAISE NOTICE '✅ 添加 gender 列';
    END IF;
    
    -- 添加 sweetness_preference 列
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'sweetness_preference') THEN
        ALTER TABLE users ADD COLUMN sweetness_preference TEXT DEFAULT 'medium';
        RAISE NOTICE '✅ 添加 sweetness_preference 列';
    END IF;
    
    -- 添加 favorite_brands 列
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'favorite_brands') THEN
        ALTER TABLE users ADD COLUMN favorite_brands TEXT[];
        RAISE NOTICE '✅ 添加 favorite_brands 列';
    END IF;
    
    -- 添加 disliked_ingredients 列
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'disliked_ingredients') THEN
        ALTER TABLE users ADD COLUMN disliked_ingredients TEXT[];
        RAISE NOTICE '✅ 添加 disliked_ingredients 列';
    END IF;
    
    -- 添加 daily_calorie_limit 列
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'daily_calorie_limit') THEN
        ALTER TABLE users ADD COLUMN daily_calorie_limit INTEGER DEFAULT 2000;
        RAISE NOTICE '✅ 添加 daily_calorie_limit 列';
    END IF;
    
    -- 添加 last_login 列
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login') THEN
        ALTER TABLE users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE '✅ 添加 last_login 列';
    END IF;
    
    -- 添加 login_count 列
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'login_count') THEN
        ALTER TABLE users ADD COLUMN login_count INTEGER DEFAULT 0;
        RAISE NOTICE '✅ 添加 login_count 列';
    END IF;
    
    -- 添加 is_active 列
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        RAISE NOTICE '✅ 添加 is_active 列';
    END IF;
    
    -- 添加 profile_completed 列
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'profile_completed') THEN
        ALTER TABLE users ADD COLUMN profile_completed BOOLEAN DEFAULT FALSE;
        RAISE NOTICE '✅ 添加 profile_completed 列';
    END IF;
    
    -- 添加 created_at 列
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'created_at') THEN
        ALTER TABLE users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE '✅ 添加 created_at 列';
    END IF;
    
    -- 添加 updated_at 列
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE '✅ 添加 updated_at 列';
    END IF;
    
    RAISE NOTICE '🎉 所有列添加完成！';
END $$;

-- 创建必要的索引
DO $$
BEGIN
    RAISE NOTICE '🔍 创建索引...';
    
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);
    CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
    CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
    
    RAISE NOTICE '✅ 索引创建完成！';
END $$;

-- 显示最终的表结构
DO $$
DECLARE
    col_record RECORD;
    column_count INTEGER;
BEGIN
    RAISE NOTICE '📊 修复后的 users 表结构:';
    
    -- 统计列数
    SELECT COUNT(*) INTO column_count FROM information_schema.columns WHERE table_name = 'users';
    RAISE NOTICE '   总列数: %', column_count;
    RAISE NOTICE '';
    
    -- 显示所有列
    FOR col_record IN 
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '   - %: % (可空: %, 默认值: %)', 
            col_record.column_name, 
            col_record.data_type, 
            col_record.is_nullable, 
            COALESCE(col_record.column_default, 'NULL');
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 users 表结构修复完成！现在可以运行其他脚本了。';
END $$;