-- =====================================================================================
-- 轻茶纪应用数据库设计 - 基于实际产品功能分析
-- =====================================================================================
-- 此脚本基于对应用实际功能的深入分析，创建完全匹配产品需求的数据库表结构
-- 分析来源：热量查询页面、我的记录页面、个人资料页面、注册登录功能
-- =====================================================================================

-- 设置客户端编码为 UTF-8
SET client_encoding = 'UTF8';

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 清理可能存在的旧约束
DO $$ 
BEGIN
    -- 删除可能存在的旧约束
    ALTER TABLE IF EXISTS users DROP CONSTRAINT IF EXISTS users_gender_check;
    ALTER TABLE IF EXISTS tea_records DROP CONSTRAINT IF EXISTS tea_records_rating_check;
    ALTER TABLE IF EXISTS tea_records DROP CONSTRAINT IF EXISTS tea_records_size_check;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- =====================================================================================
-- 1. 用户表 (users) - 基于注册登录和个人资料功能
-- =====================================================================================
-- 功能来源：
-- - 注册页面：用户名、密码
-- - 个人资料页面：甜度偏好、喜爱品牌、不喜欢的配料
-- - 登录统计：登录次数、最后登录时间

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL, -- 使用 text 替代 varchar
    password_hash TEXT NOT NULL,
    
    -- 个人资料页面的偏好设置
    sweetness_preference TEXT DEFAULT 'medium', -- 使用 text 类型
    favorite_brands TEXT[], -- 喜爱的奶茶品牌数组
    disliked_ingredients TEXT[], -- 不喜欢的配料数组
    
    -- 登录统计
    last_login TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    
    -- 系统字段
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- =====================================================================================
-- 2. 奶茶产品表 (tea_products) - 基于热量查询功能
-- =====================================================================================
-- 功能来源：
-- - 热量查询页面：品牌搜索、奶茶选择、基础热量信息
-- - 智能推荐系统：产品推荐

CREATE TABLE IF NOT EXISTS tea_products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL, -- 使用 text 替代 varchar
    brand TEXT NOT NULL, -- 使用 text 类型
    category TEXT NOT NULL, -- 使用 text 类型
    
    -- 热量信息（基于中杯标准）
    calories INTEGER NOT NULL, -- 基础热量（kcal）
    
    -- 产品描述
    description TEXT,
    
    -- 系统字段
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- =====================================================================================
-- 3. 奶茶记录表 (tea_records) - 基于我的记录功能
-- =====================================================================================
-- 功能来源：
-- - 记录奶茶页面：奶茶选择、杯型、糖度、配料、热量计算、心情、备注
-- - 我的记录页面：记录展示、编辑、删除
-- - 热量统计：每周热量预算管理

CREATE TABLE IF NOT EXISTS tea_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- 奶茶基本信息
    tea_name TEXT NOT NULL, -- 使用 text 替代 varchar
    brand TEXT, -- 使用 text 类型
    tea_product_id INTEGER REFERENCES tea_products(id), -- 关联产品表（可选）
    
    -- 定制信息
    size TEXT NOT NULL DEFAULT 'medium', -- 杯型：small/medium/large
    sweetness_level INTEGER NOT NULL DEFAULT 50, -- 糖度百分比：0-100
    toppings TEXT[], -- 选择的配料数组
    
    -- 热量信息
    estimated_calories INTEGER NOT NULL,
    is_manual_calories BOOLEAN DEFAULT FALSE,
    
    -- 个人化信息
    mood TEXT, -- 心情
    notes TEXT, -- 个人备注
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    
    -- 记录时间
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 系统字段
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE -- 新增 is_active 列
);

-- =====================================================================================
-- 4. 用户偏好表 (user_preferences) - 基于个性化推荐功能
-- =====================================================================================
-- 功能来源：
-- - 智能推荐系统：基于用户偏好的推荐
-- - 个人资料管理：灵活的偏好设置存储

CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    preference_key VARCHAR(50) NOT NULL, -- 偏好键名
    preference_value JSONB, -- 偏好值（JSON格式，支持复杂数据）
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, preference_key)
);

-- =====================================================================================
-- 5. 每日统计表 (daily_stats) - 基于热量统计功能
-- =====================================================================================
-- 功能来源：
-- - 我的记录页面：每周热量统计
-- - 首页仪表板：热量摄入展示
-- - 预算管理：每周热量预算对比

CREATE TABLE IF NOT EXISTS daily_stats (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL, -- 统计日期
    
    -- 每日统计数据
    total_calories INTEGER DEFAULT 0, -- 当日总热量
    tea_count INTEGER DEFAULT 0, -- 当日奶茶杯数
    average_rating DECIMAL(3,2), -- 当日平均评分
    
    -- 系统字段
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, date)
);

-- =====================================================================================
-- 6. 创建索引以优化查询性能
-- =====================================================================================

-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- 奶茶产品表索引
CREATE INDEX IF NOT EXISTS idx_tea_products_brand ON tea_products(brand);
CREATE INDEX IF NOT EXISTS idx_tea_products_category ON tea_products(category);
CREATE INDEX IF NOT EXISTS idx_tea_products_name ON tea_products(name);
CREATE INDEX IF NOT EXISTS idx_tea_products_is_active ON tea_products(is_active);

-- 奶茶记录表索引
CREATE INDEX IF NOT EXISTS idx_tea_records_user_id ON tea_records(user_id);
CREATE INDEX IF NOT EXISTS idx_tea_records_recorded_at ON tea_records(recorded_at);
CREATE INDEX IF NOT EXISTS idx_tea_records_user_date ON tea_records(user_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_tea_records_brand ON tea_records(brand);
CREATE INDEX IF NOT EXISTS idx_tea_records_rating ON tea_records(rating) WHERE rating IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tea_records_is_active ON tea_records(is_active); -- 新增的索引

-- 用户偏好表索引
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON user_preferences(preference_key);

-- 每日统计表索引
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_id ON daily_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON daily_stats(user_id, date);

-- =====================================================================================
-- 7. 创建触发器函数
-- =====================================================================================

-- 更新时间戳触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 自动更新每日统计的触发器函数
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS TRIGGER AS $$
DECLARE
    record_date DATE;
    user_uuid UUID;
BEGIN
    -- 获取记录日期和用户ID
    IF TG_OP = 'DELETE' THEN
        record_date := OLD.recorded_at::DATE;
        user_uuid := OLD.user_id;
    ELSE
        record_date := NEW.recorded_at::DATE;
        user_uuid := NEW.user_id;
    END IF;
    
    -- 重新计算该用户该日期的统计数据
    INSERT INTO daily_stats (user_id, date, total_calories, tea_count, average_rating)
    SELECT 
        user_uuid,
        record_date,
        COALESCE(SUM(estimated_calories), 0),
        COUNT(*),
        AVG(rating)
    FROM tea_records 
    WHERE user_id = user_uuid 
      AND recorded_at::DATE = record_date
    ON CONFLICT (user_id, date) 
    DO UPDATE SET
        total_calories = EXCLUDED.total_calories,
        tea_count = EXCLUDED.tea_count,
        average_rating = EXCLUDED.average_rating,
        updated_at = NOW();
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- =====================================================================================
-- 8. 创建触发器
-- =====================================================================================

-- 自动更新时间戳触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tea_records_updated_at ON tea_records;
CREATE TRIGGER update_tea_records_updated_at
    BEFORE UPDATE ON tea_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 自动更新每日统计触发器
DROP TRIGGER IF EXISTS trigger_update_daily_stats_insert ON tea_records;
CREATE TRIGGER trigger_update_daily_stats_insert
    AFTER INSERT ON tea_records
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_stats();

DROP TRIGGER IF EXISTS trigger_update_daily_stats_update ON tea_records;
CREATE TRIGGER trigger_update_daily_stats_update
    AFTER UPDATE ON tea_records
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_stats();

DROP TRIGGER IF EXISTS trigger_update_daily_stats_delete ON tea_records;
CREATE TRIGGER trigger_update_daily_stats_delete
    AFTER DELETE ON tea_records
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_stats();

-- =====================================================================================
-- 9. 插入示例奶茶产品数据
-- =====================================================================================
-- 基于热量查询页面的品牌和产品需求

INSERT INTO tea_products (name, brand, category, calories, description) VALUES
-- 茶百道
('珍珠奶茶', '茶百道', '奶茶', 320, '经典珍珠奶茶，香滑奶茶配Q弹珍珠'),
('芋泥啵啵茶', '茶百道', '奶茶', 380, '浓郁芋泥配啵啵珍珠'),
('杨枝甘露', '茶百道', '果茶', 280, '芒果西柚的完美结合'),

-- 奈雪的茶
('霸气橙子', '奈雪的茶', '果茶', 220, '新鲜橙子制作的果茶'),
('芝士莓莓', '奈雪的茶', '奶茶', 350, '草莓配芝士奶盖'),
('霸气芝士草莓', '奈雪的茶', '奶茶', 380, '草莓果茶配芝士奶盖'),

-- 蜜雪冰城
('珍珠奶茶', '蜜雪冰城', '奶茶', 280, '经济实惠的珍珠奶茶'),
('柠檬水', '蜜雪冰城', '果茶', 120, '清爽柠檬水'),
('摇摇奶昔', '蜜雪冰城', '奶茶', 320, '香浓奶昔'),

-- 一点点
('珍珠奶茶', '一点点', '奶茶', 300, '台式珍珠奶茶'),
('红茶玛奇朵', '一点点', '奶茶', 250, '红茶配奶盖'),
('柠檬蜜', '一点点', '果茶', 180, '蜂蜜柠檬茶'),

-- COCO都可
('珍珠奶茶', 'COCO都可', '奶茶', 310, 'COCO经典珍珠奶茶'),
('百香果双响炮', 'COCO都可', '果茶', 200, '百香果配椰果'),
('奶茶三兄弟', 'COCO都可', '奶茶', 350, '珍珠+布丁+仙草'),

-- 益禾堂
('烤奶', '益禾堂', '奶茶', 290, '香浓烤奶茶'),
('芋圆奶茶', '益禾堂', '奶茶', 340, 'Q弹芋圆配奶茶'),

-- 沪上阿姨
('血糯米奶茶', '沪上阿姨', '奶茶', 360, '血糯米配奶茶'),
('满杯红柚', '沪上阿姨', '果茶', 240, '新鲜红柚果茶')
ON CONFLICT DO NOTHING;

-- =====================================================================================
-- 10. 创建有用的视图
-- =====================================================================================

-- 用户统计概览视图
CREATE OR REPLACE VIEW user_stats_overview AS
SELECT 
    u.id,
    u.username,
    u.sweetness_preference,
    u.favorite_brands,
    u.disliked_ingredients,
    u.last_login,
    u.login_count,
    u.created_at as user_since,
    COALESCE(tr.total_records, 0) as total_tea_records,
    COALESCE(tr.total_calories, 0) as lifetime_calories,
    COALESCE(tr.average_rating, 0) as average_tea_rating,
    COALESCE(ds.current_week_calories, 0) as current_week_calories
FROM users u
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as total_records,
        SUM(estimated_calories) as total_calories,
        AVG(rating) as average_rating
    FROM tea_records
    GROUP BY user_id
) tr ON u.id = tr.user_id
LEFT JOIN (
    SELECT 
        user_id,
        SUM(total_calories) as current_week_calories
    FROM daily_stats
    WHERE date >= date_trunc('week', CURRENT_DATE)
    GROUP BY user_id
) ds ON u.id = ds.user_id;

-- 热门奶茶产品视图
CREATE OR REPLACE VIEW popular_tea_products AS
SELECT 
    tp.id,
    tp.name,
    tp.brand,
    tp.category,
    tp.calories,
    tp.description,
    COALESCE(tr.order_count, 0) as order_count,
    COALESCE(tr.average_rating, 0) as average_rating
FROM tea_products tp
LEFT JOIN (
    SELECT 
        tea_product_id,
        COUNT(*) as order_count,
        AVG(rating) as average_rating
    FROM tea_records
    WHERE tea_product_id IS NOT NULL
    GROUP BY tea_product_id
) tr ON tp.id = tr.tea_product_id
WHERE tp.is_active = true
ORDER BY COALESCE(tr.order_count, 0) DESC, tp.name;

-- =====================================================================================
-- 11. 完成提示
-- =====================================================================================

DO $$
DECLARE
    product_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO product_count FROM tea_products;
    
    RAISE NOTICE '=== 轻茶纪数据库设计完成 ===';  
    RAISE NOTICE '基于产品功能分析创建的核心表：';
    RAISE NOTICE '1. users - 用户注册登录和个人偏好';
    RAISE NOTICE '2. tea_products - 奶茶产品信息（热量查询）';
    RAISE NOTICE '3. tea_records - 奶茶消费记录（我的记录）';
    RAISE NOTICE '4. user_preferences - 用户偏好设置';
    RAISE NOTICE '5. daily_stats - 每日热量统计';
    RAISE NOTICE '';
    RAISE NOTICE '已插入 % 个奶茶产品', product_count;
    RAISE NOTICE '数据库已准备就绪，可以支持所有核心功能！';
END $$;