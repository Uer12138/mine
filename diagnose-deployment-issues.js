// 诊断部署环境的数据同步问题
const { createClient } = require('@supabase/supabase-js');

// 模拟环境变量检查
function checkEnvironmentVariables() {
  console.log('=== 环境变量检查 ===');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  const missing = [];
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value || value.length === 0) {
      missing.push(varName);
      console.log(`❌ ${varName}: 未设置或为空`);
    } else {
      console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
    }
  });
  
  if (missing.length > 0) {
    console.log('\n🚨 缺少必要的环境变量:');
    missing.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    console.log('\n📝 解决方案:');
    console.log('1. 在部署平台（如Vercel）的环境变量设置中添加这些变量');
    console.log('2. 确保变量值正确（从Supabase项目设置中获取）');
    console.log('3. 重新部署应用');
    return false;
  }
  
  return true;
}

// 测试Supabase连接
async function testSupabaseConnection() {
  console.log('\n=== Supabase连接测试 ===');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ 无法创建Supabase客户端：环境变量缺失');
    return false;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 测试基本连接
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Supabase连接失败:', error.message);
      console.log('\n📝 可能的原因:');
      console.log('1. URL或API Key不正确');
      console.log('2. 数据库表不存在');
      console.log('3. RLS（行级安全）策略阻止访问');
      return false;
    }
    
    console.log('✅ Supabase连接成功');
    return true;
  } catch (error) {
    console.log('❌ Supabase连接异常:', error.message);
    return false;
  }
}

// 检查数据库表结构
async function checkDatabaseTables() {
  console.log('\n=== 数据库表结构检查 ===');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ 无法检查表结构：环境变量缺失');
    return false;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 检查users表
    console.log('检查users表...');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.log('❌ users表访问失败:', usersError.message);
    } else {
      console.log('✅ users表可访问');
    }
    
    // 检查tea_records表
    console.log('检查tea_records表...');
    const { data: recordsData, error: recordsError } = await supabase
      .from('tea_records')
      .select('*')
      .limit(1);
    
    if (recordsError) {
      console.log('❌ tea_records表访问失败:', recordsError.message);
    } else {
      console.log('✅ tea_records表可访问');
    }
    
    return !usersError && !recordsError;
  } catch (error) {
    console.log('❌ 表结构检查异常:', error.message);
    return false;
  }
}

// 测试用户注册功能
async function testUserRegistration() {
  console.log('\n=== 用户注册功能测试 ===');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ 无法测试注册：环境变量缺失');
    return false;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const testUsername = `test_user_${Date.now()}`;
    
    // 尝试插入测试用户
    const { data, error } = await supabase
      .from('users')
      .insert({
        username: testUsername,
        password_hash: 'test_hash_123'
      })
      .select()
      .single();
    
    if (error) {
      console.log('❌ 用户注册测试失败:', error.message);
      console.log('\n📝 可能的原因:');
      console.log('1. users表缺少必要字段');
      console.log('2. RLS策略阻止插入');
      console.log('3. 字段类型不匹配');
      return false;
    }
    
    console.log('✅ 用户注册测试成功');
    
    // 清理测试数据
    await supabase
      .from('users')
      .delete()
      .eq('id', data.id);
    
    return true;
  } catch (error) {
    console.log('❌ 用户注册测试异常:', error.message);
    return false;
  }
}

// 测试奶茶记录保存
async function testTeaRecordSaving() {
  console.log('\n=== 奶茶记录保存测试 ===');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ 无法测试记录保存：环境变量缺失');
    return false;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 创建测试用户
    const testUsername = `test_user_${Date.now()}`;
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        username: testUsername,
        password_hash: 'test_hash_123'
      })
      .select()
      .single();
    
    if (userError) {
      console.log('❌ 无法创建测试用户:', userError.message);
      return false;
    }
    
    // 尝试插入奶茶记录
    const { data: recordData, error: recordError } = await supabase
      .from('tea_records')
      .insert({
        user_id: userData.id,
        tea_name: '测试奶茶',
        brand: '测试品牌',
        size: 'medium',
        sweetness_level: '50',
        estimated_calories: 300,
        recorded_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (recordError) {
      console.log('❌ 奶茶记录保存测试失败:', recordError.message);
      console.log('\n📝 可能的原因:');
      console.log('1. tea_records表缺少必要字段');
      console.log('2. 字段类型不匹配（如sweetness_level应为整数而非字符串）');
      console.log('3. 外键约束问题');
      
      // 清理测试用户
      await supabase.from('users').delete().eq('id', userData.id);
      return false;
    }
    
    console.log('✅ 奶茶记录保存测试成功');
    
    // 清理测试数据
    await supabase.from('tea_records').delete().eq('id', recordData.id);
    await supabase.from('users').delete().eq('id', userData.id);
    
    return true;
  } catch (error) {
    console.log('❌ 奶茶记录保存测试异常:', error.message);
    return false;
  }
}

// 主诊断函数
async function diagnoseDeploymentIssues() {
  console.log('🔍 开始诊断部署环境的数据同步问题...\n');
  
  const results = {
    envVars: false,
    connection: false,
    tables: false,
    registration: false,
    records: false
  };
  
  // 1. 检查环境变量
  results.envVars = checkEnvironmentVariables();
  
  if (!results.envVars) {
    console.log('\n🛑 环境变量配置有问题，无法继续测试');
    return;
  }
  
  // 2. 测试Supabase连接
  results.connection = await testSupabaseConnection();
  
  if (!results.connection) {
    console.log('\n🛑 Supabase连接失败，无法继续测试');
    return;
  }
  
  // 3. 检查数据库表
  results.tables = await checkDatabaseTables();
  
  // 4. 测试用户注册
  results.registration = await testUserRegistration();
  
  // 5. 测试奶茶记录保存
  results.records = await testTeaRecordSaving();
  
  // 总结
  console.log('\n=== 诊断结果总结 ===');
  console.log(`环境变量配置: ${results.envVars ? '✅' : '❌'}`);
  console.log(`Supabase连接: ${results.connection ? '✅' : '❌'}`);
  console.log(`数据库表访问: ${results.tables ? '✅' : '❌'}`);
  console.log(`用户注册功能: ${results.registration ? '✅' : '❌'}`);
  console.log(`奶茶记录保存: ${results.records ? '✅' : '❌'}`);
  
  if (results.envVars && results.connection && results.tables && results.registration && results.records) {
    console.log('\n🎉 所有测试通过！数据同步功能应该正常工作。');
  } else {
    console.log('\n⚠️ 发现问题，请根据上述错误信息进行修复。');
  }
  
  console.log('\n📋 常见解决方案:');
  console.log('1. 确保在部署平台设置了正确的环境变量');
  console.log('2. 在Supabase中执行所有必要的SQL脚本');
  console.log('3. 检查RLS策略是否正确配置');
  console.log('4. 确保字段类型匹配（特别是sweetness_level字段）');
}

// 如果直接运行此脚本
if (require.main === module) {
  diagnoseDeploymentIssues().catch(console.error);
}

module.exports = {
  diagnoseDeploymentIssues,
  checkEnvironmentVariables,
  testSupabaseConnection,
  checkDatabaseTables,
  testUserRegistration,
  testTeaRecordSaving
};