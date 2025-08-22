-- 奶茶卡路里管理系统数据库表结构
-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    age INTEGER,
    sweetness_preference VARCHAR(20) DEFAULT 'medium',
    favorite_brands TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建阶段表（公共表，无需关联用户）
CREATE TABLE IF NOT EXISTS phases (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建任务模板表（公共表，无需关联用户）
CREATE TABLE IF NOT EXISTS task_templates (
    id SERIAL PRIMARY KEY,
    phase_id INTEGER REFERENCES phases(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户任务表（关联用户和任务模板）
CREATE TABLE IF NOT EXISTS user_tasks (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    task_template_id INTEGER REFERENCES task_templates(id),
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, task_template_id)
);

-- 创建奶茶记录表
CREATE TABLE IF NOT EXISTS tea_records (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tea_name VARCHAR(100) NOT NULL,
    size VARCHAR(50),
    sweetness_level VARCHAR(20),
    toppings TEXT,
    estimated_calories INTEGER,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_user_tasks_user_id ON user_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_completed ON user_tasks(is_completed);
CREATE INDEX IF NOT EXISTS idx_tea_records_user_id ON tea_records(user_id);
CREATE INDEX IF NOT EXISTS idx_tea_records_recorded_at ON tea_records(recorded_at);

-- 插入阶段数据
INSERT INTO phases (name, description, order_index) VALUES
('第一阶段：基础认知建立', '帮助用户建立对奶茶热量的基础认知，了解自己的奶茶消费习惯', 1),
('第二阶段：数据收集与记录', '通过系统记录奶茶消费数据，建立数据收集习惯', 2),
('第三阶段：分析与调整', '基于收集的数据进行分析，制定个性化的奶茶摄入计划', 3)
ON CONFLICT DO NOTHING;

-- 插入任务模板数据
INSERT INTO task_templates (phase_id, title, description, order_index) VALUES
-- 第一阶段任务
(1, '列出常喝奶茶及疑问', '用10分钟，列出自己常喝的5款奶茶及疑问（如"全糖奶茶热量有多高？""加珍珠会额外增加多少卡路里？"）', 1),
(1, '创建奶茶热量记录表格', '确定需记录的关键信息（奶茶名称、规格、甜度、配料、估算热量）', 2),
(1, '查阅每日卡路里摄入标准', '安排15分钟查阅资料，明确每日卡路里摄入标准（结合自身身高体重年龄）', 3),

-- 第二阶段任务
(2, '连续3天记录奶茶信息', '连续3天，每天记录所喝奶茶的详细信息（使用番茄工作法，固定时间记录避免遗漏）', 4),
(2, '获取配料热量数据', '咨询营养师朋友或查阅权威资料，获取不同奶茶配料的热量数据（如奶盖、椰果、芋圆等）', 5),

-- 第三阶段任务
(3, '创建热量对比表', '创建常喝奶茶热量对比表，突出高/低热量选项及替代方案', 6),
(3, '撰写摄入分析初稿', '撰写个人奶茶摄入分析初稿（如"每周喝3次全糖奶茶，超额摄入约800大卡"）', 7),
(3, '获取优化建议', '请有健康管理经验的朋友审阅分析，提供奶茶选择优化建议', 8),
(3, '制定摄入计划', '根据建议制定个人奶茶摄入计划（如"换成半糖，每周不超过2次"）', 9)
ON CONFLICT DO NOTHING;
