-- 修复 tea_records 表结构，添加应用需要的字段
-- 这个脚本需要在 Supabase Dashboard 的 SQL Editor 中执行

-- 添加应用需要的字段
ALTER TABLE tea_records ADD COLUMN IF NOT EXISTS brand VARCHAR(100);
ALTER TABLE tea_records ADD COLUMN IF NOT EXISTS product_name VARCHAR(100);
ALTER TABLE tea_records ADD COLUMN IF NOT EXISTS sugar_level VARCHAR(20);
ALTER TABLE tea_records ADD COLUMN IF NOT EXISTS calories INTEGER;
ALTER TABLE tea_records ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);

-- 为了向后兼容，将现有数据迁移到新字段
UPDATE tea_records 
SET 
    calories = estimated_calories,
    brand = COALESCE(brand, '未知品牌'),
    product_name = COALESCE(product_name, tea_name),
    sugar_level = COALESCE(sugar_level, sweetness_level)
WHERE calories IS NULL OR brand IS NULL OR product_name IS NULL OR sugar_level IS NULL;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_tea_records_brand ON tea_records(brand);
CREATE INDEX IF NOT EXISTS idx_tea_records_calories ON tea_records(calories);
CREATE INDEX IF NOT EXISTS idx_tea_records_price ON tea_records(price);

-- 验证表结构
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tea_records' 
AND table_schema = 'public'
ORDER BY ordinal_position;