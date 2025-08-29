const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 手动读取 .env.local 文件
const envPath = path.join(__dirname, '.env.local');
let supabaseUrl, supabaseKey;

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  envLines.forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1].trim();
    }
  });
} catch (error) {
  console.log('❌ 无法读取 .env.local 文件:', error.message);
  process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Supabase 配置缺失');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsersTableStructure() {
  console.log('🔍 检查 users 表结构...');
  console.log('=' .repeat(50));
  
  try {
    // 1. 尝试查询一个用户记录来了解表结构
    console.log('\n1. 查询现有用户记录...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.log('❌ 查询用户表失败:', usersError.message);
      return;
    }
    
    if (users && users.length > 0) {
      console.log('✅ 找到现有用户记录');
      console.log('📋 当前表字段:');
      Object.keys(users[0]).forEach(key => {
        console.log(`   - ${key}: ${typeof users[0][key]} (${users[0][key] === null ? 'null' : 'has value'})`);
      });
    } else {
      console.log('⚠️ 用户表为空，尝试创建测试用户来检查表结构');
      
      // 2. 尝试插入一个最小的用户记录
      console.log('\n2. 尝试插入最小用户记录...');
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          username: `structure_test_${Date.now()}`,
          password_hash: 'test123'
        })
        .select()
        .single();
      
      if (insertError) {
        console.log('❌ 插入测试用户失败:', insertError.message);
        return;
      }
      
      console.log('✅ 测试用户创建成功');
      console.log('📋 当前表字段:');
      Object.keys(newUser).forEach(key => {
        console.log(`   - ${key}: ${typeof newUser[key]} (${newUser[key] === null ? 'null' : 'has value'})`);
      });
      
      // 清理测试用户
      await supabase.from('users').delete().eq('id', newUser.id);
      console.log('🧹 测试用户已清理');
    }
    
    // 3. 测试各个字段是否存在
    console.log('\n3. 测试字段存在性...');
    const fieldsToTest = [
      'id', 'username', 'password_hash', 'weight', 'height', 'age', 
      'gender', 'sweetness_preference', 'favorite_brands', 'disliked_ingredients',
      'health_goals', 'daily_calorie_limit', 'last_login', 'login_count',
      'is_active', 'profile_completed', 'created_at', 'updated_at'
    ];
    
    for (const field of fieldsToTest) {
      try {
        const testQuery = {};
        testQuery[field] = null;
        
        const { error: fieldError } = await supabase
          .from('users')
          .insert({
            username: `field_test_${Date.now()}_${Math.random()}`,
            password_hash: 'test',
            ...testQuery
          })
          .select()
          .single();
        
        if (fieldError) {
          if (fieldError.message.includes('column') && fieldError.message.includes('does not exist')) {
            console.log(`   ❌ ${field}: 字段不存在`);
          } else if (fieldError.message.includes('duplicate key')) {
            console.log(`   ✅ ${field}: 字段存在 (重复键错误)`);
          } else {
            console.log(`   ⚠️ ${field}: 其他错误 - ${fieldError.message}`);
          }
        } else {
          console.log(`   ✅ ${field}: 字段存在`);
          // 清理测试数据
          await supabase.from('users').delete().eq('username', `field_test_${Date.now()}_${Math.random()}`);
        }
      } catch (error) {
        console.log(`   ❓ ${field}: 测试失败 - ${error.message}`);
      }
    }
    
    // 4. 生成修复建议
    console.log('\n4. 修复建议...');
    console.log('📝 请在 Supabase Dashboard 的 SQL Editor 中执行以下脚本:');
    console.log('   1. scripts/create-tea-calorie-system.sql (创建基础表结构)');
    console.log('   2. fix-users-table-complete.sql (添加缺失字段)');
    console.log('   3. scripts/fix-tea-records-table.sql (修复奶茶记录表)');
    
  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error.message);
  }
}

// 运行检查
checkUsersTableStructure();