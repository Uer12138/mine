// 检查应用集成和用户数据同步状态
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ehrguihgoswxdhncmcnn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVocmd1aWhnb3N3eGRobmNtY25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNzI4NTAsImV4cCI6MjA3MTc0ODg1MH0.NVahIpHBJE0myzEh3XdvQxR6_yVLsEaZD6lknArQR4w';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAppIntegration() {
  console.log('=== 检查应用集成和用户数据同步状态 ===\n');
  
  try {
    // 1. 检查环境变量配置
    console.log('1. 检查环境变量配置...');
    const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const appMode = process.env.NEXT_PUBLIC_APP_MODE;
    
    console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${envUrl ? '✅ 已配置' : '❌ 未配置'}`);
    console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${envKey ? '✅ 已配置' : '❌ 未配置'}`);
    console.log(`   NEXT_PUBLIC_APP_MODE: ${appMode || '未设置 (默认为localStorage模式)'}`);
    
    if (!envUrl || !envKey) {
      console.log('\n⚠️  环境变量未正确配置，应用将使用localStorage模式');
      console.log('   请确保.env.local文件中包含正确的Supabase配置');
    }
    
    // 2. 检查数据库中的现有用户
    console.log('\n2. 检查数据库中的现有用户...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, sweetness_preference, favorite_brands, disliked_ingredients, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (usersError) {
      console.log('❌ 获取用户列表失败:', usersError.message);
    } else {
      console.log(`📊 数据库中共有 ${users.length} 个用户:`);
      users.forEach((user, index) => {
        const hasPreferences = user.sweetness_preference || user.favorite_brands?.length > 0 || user.disliked_ingredients?.length > 0;
        console.log(`   ${index + 1}. ${user.username}`);
        console.log(`      - ID: ${user.id}`);
        console.log(`      - 偏好设置: ${hasPreferences ? '✅ 已设置' : '❌ 未设置'}`);
        console.log(`      - 创建时间: ${user.created_at}`);
        console.log(`      - 更新时间: ${user.updated_at}`);
        if (hasPreferences) {
          console.log(`      - 甜度偏好: ${user.sweetness_preference || '未设置'}`);
          console.log(`      - 喜欢品牌: ${user.favorite_brands?.join(', ') || '未设置'}`);
          console.log(`      - 不喜欢配料: ${user.disliked_ingredients?.join(', ') || '未设置'}`);
        }
        console.log('');
      });
    }
    
    // 3. 检查应用模式检测逻辑
    console.log('3. 检查应用模式检测逻辑...');
    
    // 模拟应用中的Supabase客户端创建逻辑
    const hasSupabaseConfig = !!(envUrl && envKey);
    console.log(`   Supabase配置检测: ${hasSupabaseConfig ? '✅ 已配置' : '❌ 未配置'}`);
    
    if (hasSupabaseConfig) {
      console.log('   应用将使用: 🗄️  Supabase数据库模式');
      console.log('   用户数据将保存到云端数据库');
    } else {
      console.log('   应用将使用: 💾 localStorage本地存储模式');
      console.log('   用户数据将保存到浏览器本地存储');
    }
    
    // 4. 提供解决方案建议
    console.log('\n4. 问题诊断和解决方案...');
    
    if (!hasSupabaseConfig) {
      console.log('🔧 问题: 环境变量未配置，应用使用localStorage模式');
      console.log('💡 解决方案:');
      console.log('   1. 确保.env.local文件存在且包含正确的Supabase配置');
      console.log('   2. 重启开发服务器 (npm run dev)');
      console.log('   3. 检查浏览器控制台是否有相关错误信息');
    } else {
      console.log('✅ 环境配置正常，应用应该使用Supabase模式');
      
      if (users.length === 0) {
        console.log('💡 建议: 数据库中暂无用户，请尝试注册新用户测试');
      } else {
        const usersWithPreferences = users.filter(u => 
          u.sweetness_preference || u.favorite_brands?.length > 0 || u.disliked_ingredients?.length > 0
        );
        
        if (usersWithPreferences.length === 0) {
          console.log('💡 建议: 用户存在但偏好设置为空，请尝试在个人资料页面更新偏好设置');
        } else {
          console.log('✅ 用户数据同步正常，偏好设置已保存到数据库');
        }
      }
    }
    
    // 5. 检查数据库表结构
    console.log('\n5. 检查关键数据库表...');
    
    // 检查users表
    const { data: usersTableTest, error: usersTableError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    console.log(`   users表: ${usersTableError ? '❌ 访问失败' : '✅ 正常'}`);
    
    // 检查tea_records表（如果存在）
    const { data: teaRecordsTest, error: teaRecordsError } = await supabase
      .from('tea_records')
      .select('count')
      .limit(1);
    
    console.log(`   tea_records表: ${teaRecordsError ? '❌ 不存在或访问失败' : '✅ 正常'}`);
    
    console.log('\n=== 检查完成 ===');
    
  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error.message);
  }
}

checkAppIntegration();