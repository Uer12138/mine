// 修复users表结构的脚本
const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = 'https://ehrguihgoswxdhncmcnn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVocmd1aWhnb3N3eGRobmNtY25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNzI4NTAsImV4cCI6MjA3MTc0ODg1MH0.NVahIpHBJE0myzEh3XdvQxR6_yVLsEaZD6lknArQR4w';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUsersTable() {
  console.log('=== 修复 users 表结构 ===\n');
  
  // 需要添加的字段
  const columnsToAdd = [
    { name: 'disliked_ingredients', type: 'TEXT[]', description: '不喜欢的配料' },
    { name: 'daily_calorie_limit', type: 'INTEGER DEFAULT 2000', description: '每日卡路里限制' },
    { name: 'last_login', type: 'TIMESTAMP WITH TIME ZONE', description: '最后登录时间' },
    { name: 'login_count', type: 'INTEGER DEFAULT 0', description: '登录次数' },
    { name: 'is_active', type: 'BOOLEAN DEFAULT TRUE', description: '账户是否激活' },
    { name: 'profile_completed', type: 'BOOLEAN DEFAULT FALSE', description: '资料是否完整' }
  ];
  
  try {
    // 首先检查当前表结构
    console.log('1. 检查当前表结构...');
    
    // 尝试查询表结构的另一种方法
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.log('❌ 无法访问users表:', testError.message);
      return;
    }
    
    console.log('✅ users表访问正常\n');
    
    // 逐个添加字段
    for (const column of columnsToAdd) {
      console.log(`2. 尝试添加字段: ${column.name} (${column.description})`);
      
      const alterSQL = `ALTER TABLE users ADD COLUMN IF NOT EXISTS ${column.name} ${column.type}`;
      
      // 由于无法直接执行DDL，我们尝试通过插入测试来检查字段是否存在
      try {
        const testInsert = {};
        testInsert[column.name] = null;
        
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            username: `test_column_check_${Date.now()}`,
            password_hash: 'test',
            ...testInsert
          })
          .select()
          .single();
        
        if (insertError) {
          if (insertError.message.includes('column') && insertError.message.includes('does not exist')) {
            console.log(`   ❌ 字段 ${column.name} 不存在，需要手动添加`);
          } else {
            console.log(`   ✅ 字段 ${column.name} 已存在`);
          }
        } else {
          console.log(`   ✅ 字段 ${column.name} 已存在`);
          // 删除测试数据
          await supabase
            .from('users')
            .delete()
            .eq('username', `test_column_check_${Date.now()}`);
        }
      } catch (error) {
        console.log(`   ❓ 无法检查字段 ${column.name}:`, error.message);
      }
    }
    
    console.log('\n=== 字段检查完成 ===');
    console.log('\n📋 需要手动执行的SQL语句:');
    console.log('请在Supabase Dashboard的SQL Editor中执行以下语句:\n');
    
    columnsToAdd.forEach(column => {
      console.log(`-- 添加${column.description}`);
      console.log(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${column.name} ${column.type};`);
    });
    
    console.log('\n-- 更新现有用户的默认值');
    console.log('UPDATE users SET login_count = 0 WHERE login_count IS NULL;');
    console.log('UPDATE users SET is_active = TRUE WHERE is_active IS NULL;');
    console.log('UPDATE users SET profile_completed = FALSE WHERE profile_completed IS NULL;');
    console.log('UPDATE users SET daily_calorie_limit = 2000 WHERE daily_calorie_limit IS NULL;');
    
  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error.message);
  }
}

// 运行修复
fixUsersTable();