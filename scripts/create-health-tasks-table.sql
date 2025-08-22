-- 创建健康任务表
CREATE TABLE IF NOT EXISTS health_tasks (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id VARCHAR(50) NOT NULL,
  task_title TEXT NOT NULL,
  task_description TEXT,
  stage VARCHAR(20) NOT NULL, -- 'beginner', 'intermediate', 'advanced'
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 去除RLS (Row Level Security) - Demo产品
ALTER TABLE health_tasks DISABLE ROW LEVEL SECURITY;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_health_tasks_user_id ON health_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_health_tasks_stage ON health_tasks(stage);
CREATE INDEX IF NOT EXISTS idx_health_tasks_completed ON health_tasks(is_completed);

-- 创建更新时间戳的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_health_tasks_updated_at 
    BEFORE UPDATE ON health_tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
