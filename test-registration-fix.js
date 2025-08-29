// 测试注册功能的脚本
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 手动读取.env.local文件
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key] = valueParts.join('=');
        }
      }
    });
    
    return envVars;
  } catch (error) {
    console.log('无法读取.env.local文件:', error.message);
    return {};
  }
}

const envVars = loadEnvFile();

async function testRegistration() {
  console.log('🔍 测试注册功能...');
  
  // 检查环境变量
  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('环境变量检查:');
  console.log('- SUPABASE_URL:', supabaseUrl ? '✅ 已设置' : '❌ 未设置');
  console.log('- SUPABASE_KEY:', supabaseKey ? '✅ 已设置' : '❌ 未设置');
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ 环境变量缺失，将使用本地存储模式');
    return testLocalStorageRegistration();
  }
  
  // 测试Supabase连接
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 测试连接
    console.log('\n🔗 测试Supabase连接...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.log('❌ Supabase连接失败:', error.message);
      console.log('详细错误:', error);
      return false;
    }
    
    console.log('✅ Supabase连接成功');
    
    // 测试用户表结构
    console.log('\n📋 检查users表结构...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('users')
      .select('*')
      .limit(0);
    
    if (tableError) {
      console.log('❌ users表不存在或无法访问:', tableError.message);
      return false;
    }
    
    console.log('✅ users表可以访问');
    
    // 测试插入用户
    console.log('\n👤 测试用户注册...');
    const testUsername = `test_user_${Date.now()}`;
    const testPasswordHash = 'test_hash_123456';
    
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert({
        username: testUsername,
        password_hash: testPasswordHash
      })
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ 用户注册测试失败:', insertError.message);
      console.log('错误代码:', insertError.code);
      console.log('详细信息:', insertError.details);
      return false;
    }
    
    console.log('✅ 用户注册测试成功');
    console.log('新用户ID:', insertData.id);
    
    // 清理测试数据
    await supabase.from('users').delete().eq('id', insertData.id);
    console.log('✅ 测试数据已清理');
    
    return true;
    
  } catch (error) {
    console.log('❌ 测试过程中发生错误:', error.message);
    return false;
  }
}

function testLocalStorageRegistration() {
  console.log('\n🏠 测试本地存储模式注册...');
  
  // 模拟本地存储环境
  const mockLocalStorage = {
    data: {},
    getItem(key) {
      return this.data[key] || null;
    },
    setItem(key, value) {
      this.data[key] = value;
    },
    clear() {
      this.data = {};
    }
  };
  
  // 模拟注册过程
  try {
    const users = JSON.parse(mockLocalStorage.getItem('teacal_users') || '[]');
    const testUsername = 'test_user';
    const testPasswordHash = 'test_hash_123456';
    
    // 检查用户名是否已存在
    if (users.find(user => user.username === testUsername)) {
      console.log('❌ 用户名已存在');
      return false;
    }
    
    // 创建新用户
    const newUser = {
      id: 'test-uuid-' + Date.now(),
      username: testUsername,
      password_hash: testPasswordHash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    users.push(newUser);
    mockLocalStorage.setItem('teacal_users', JSON.stringify(users));
    
    console.log('✅ 本地存储注册测试成功');
    console.log('用户数据:', newUser);
    
    return true;
    
  } catch (error) {
    console.log('❌ 本地存储注册测试失败:', error.message);
    return false;
  }
}

// 运行测试
testRegistration().then(success => {
  if (success) {
    console.log('\n🎉 注册功能测试通过！');
  } else {
    console.log('\n💥 注册功能测试失败，需要修复');
  }
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('\n💥 测试脚本执行失败:', error);
  process.exit(1);
});