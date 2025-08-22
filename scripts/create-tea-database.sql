-- 创建奶茶数据库表
-- 奶茶产品表
CREATE TABLE IF NOT EXISTS tea_products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    base_calories INTEGER NOT NULL,
    sugar_content VARCHAR(20) DEFAULT 'medium',
    size VARCHAR(20) DEFAULT 'medium',
    ingredients TEXT[],
    category VARCHAR(20) CHECK (category IN ('low', 'medium', 'high')),
    rating DECIMAL(2,1) DEFAULT 4.0,
    image_url VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_tea_products_name ON tea_products(name);
CREATE INDEX IF NOT EXISTS idx_tea_products_brand ON tea_products(brand);
CREATE INDEX IF NOT EXISTS idx_tea_products_category ON tea_products(category);
CREATE INDEX IF NOT EXISTS idx_tea_products_calories ON tea_products(base_calories);

-- 插入预设奶茶数据
INSERT INTO tea_products (name, brand, base_calories, sugar_content, size, ingredients, category, rating, description) VALUES
-- 喜茶系列
('多肉葡萄', '喜茶', 280, 'medium', 'medium', ARRAY['葡萄', '芝士奶盖', '茶底'], 'medium', 4.5, '新鲜葡萄搭配芝士奶盖，口感丰富'),
('芝芝莓莓', '喜茶', 320, 'medium', 'medium', ARRAY['草莓', '芝士奶盖', '茶底'], 'high', 4.6, '草莓与芝士的完美结合'),
('满杯红柚', '喜茶', 250, 'low', 'medium', ARRAY['红柚', '茶底'], 'low', 4.3, '清香红柚茶，低糖健康'),
('芝芝桃桃', '喜茶', 310, 'medium', 'medium', ARRAY['桃子', '芝士奶盖', '茶底'], 'high', 4.7, '桃子的香甜配上浓郁芝士'),

-- 奈雪的茶系列
('霸气橙子', '奈雪的茶', 290, 'medium', 'medium', ARRAY['橙子', '茶底'], 'medium', 4.4, '新鲜橙子制作，维C丰富'),
('霸气葡萄', '奈雪的茶', 270, 'medium', 'medium', ARRAY['葡萄', '茶底'], 'medium', 4.2, '葡萄果肉丰富，酸甜可口'),
('芝士草莓', '奈雪的茶', 330, 'medium', 'medium', ARRAY['草莓', '芝士奶盖', '茶底'], 'high', 4.5, '草莓与芝士的经典搭配'),
('蜜桃乌龙茶', '奈雪的茶', 220, 'low', 'medium', ARRAY['蜜桃', '乌龙茶'], 'low', 4.1, '清香蜜桃配乌龙茶底'),

-- 一点点系列
('波霸奶茶', '一点点', 350, 'high', 'medium', ARRAY['珍珠', '奶茶'], 'high', 4.3, '经典珍珠奶茶，Q弹珍珠'),
('红茶拿铁', '一点点', 280, 'medium', 'medium', ARRAY['红茶', '牛奶'], 'medium', 4.2, '红茶与牛奶的完美融合'),
('柠檬蜂蜜', '一点点', 180, 'low', 'medium', ARRAY['柠檬', '蜂蜜'], 'low', 4.0, '清爽柠檬蜂蜜茶'),
('阿华田', '一点点', 320, 'medium', 'medium', ARRAY['阿华田粉', '牛奶'], 'high', 4.4, '浓郁阿华田风味'),

-- CoCo都可系列
('珍珠奶茶', 'CoCo都可', 340, 'high', 'medium', ARRAY['珍珠', '奶茶'], 'high', 4.1, 'CoCo经典珍珠奶茶'),
('三兄弟', 'CoCo都可', 380, 'high', 'medium', ARRAY['珍珠', '布丁', '仙草', '奶茶'], 'high', 4.3, '三种配料的丰富口感'),
('柠檬养乐多', 'CoCo都可', 200, 'medium', 'medium', ARRAY['柠檬', '养乐多'], 'low', 4.0, '酸甜柠檬养乐多'),
('椰果奶茶', 'CoCo都可', 300, 'medium', 'medium', ARRAY['椰果', '奶茶'], 'medium', 4.2, '椰果的清脆配奶茶'),

-- 茶颜悦色系列
('幽兰拿铁', '茶颜悦色', 290, 'medium', 'medium', ARRAY['茶底', '牛奶', '奶泡'], 'medium', 4.6, '茶颜悦色招牌饮品'),
('声声乌龙', '茶颜悦色', 260, 'low', 'medium', ARRAY['乌龙茶', '牛奶'], 'medium', 4.4, '清香乌龙茶拿铁'),
('桂花弄', '茶颜悦色', 240, 'low', 'medium', ARRAY['桂花', '茶底'], 'low', 4.3, '桂花香气浓郁'),
('筝筝纸鸢', '茶颜悦色', 270, 'medium', 'medium', ARRAY['茶底', '牛奶', '坚果'], 'medium', 4.5, '坚果香味的特色茶饮'),

-- 书亦烧仙草系列
('烧仙草奶茶', '书亦烧仙草', 320, 'medium', 'medium', ARRAY['烧仙草', '奶茶', '珍珠'], 'high', 4.2, '温热烧仙草配奶茶'),
('芋圆奶茶', '书亦烧仙草', 340, 'medium', 'medium', ARRAY['芋圆', '奶茶'], 'high', 4.3, 'Q弹芋圆配香浓奶茶'),
('红豆奶茶', '书亦烧仙草', 310, 'medium', 'medium', ARRAY['红豆', '奶茶'], 'medium', 4.1, '红豆的甜蜜配奶茶'),

-- 古茗系列
('杨枝甘露', '古茗', 280, 'medium', 'medium', ARRAY['芒果', '西柚', '椰浆'], 'medium', 4.4, '港式经典杨枝甘露'),
('芒果绿茶', '古茗', 220, 'low', 'medium', ARRAY['芒果', '绿茶'], 'low', 4.2, '清香芒果绿茶'),
('奶茶三兄弟', '古茗', 360, 'high', 'medium', ARRAY['珍珠', '布丁', '椰果', '奶茶'], 'high', 4.3, '三种配料的奶茶'),

-- 蜜雪冰城系列
('珍珠奶茶', '蜜雪冰城', 300, 'high', 'medium', ARRAY['珍珠', '奶茶'], 'medium', 3.9, '性价比高的珍珠奶茶'),
('柠檬水', '蜜雪冰城', 120, 'low', 'medium', ARRAY['柠檬'], 'low', 3.8, '清爽柠檬水'),
('摇摇奶昔', '蜜雪冰城', 280, 'medium', 'medium', ARRAY['奶昔'], 'medium', 4.0, '香浓奶昔'),
('红豆牛奶冰', '蜜雪冰城', 250, 'medium', 'medium', ARRAY['红豆', '牛奶'], 'medium', 3.9, '红豆牛奶冰沙')
ON CONFLICT DO NOTHING;

-- 更新奶茶记录表，添加对奶茶产品的引用
ALTER TABLE tea_records ADD COLUMN IF NOT EXISTS tea_product_id INTEGER REFERENCES tea_products(id);
ALTER TABLE tea_records ADD COLUMN IF NOT EXISTS custom_name VARCHAR(100);
ALTER TABLE tea_records ADD COLUMN IF NOT EXISTS mood VARCHAR(20);
ALTER TABLE tea_records ADD COLUMN IF NOT EXISTS notes TEXT;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_tea_records_tea_product_id ON tea_records(tea_product_id);
CREATE INDEX IF NOT EXISTS idx_tea_records_mood ON tea_records(mood);