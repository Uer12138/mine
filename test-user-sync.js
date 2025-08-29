// 测试用户数据同步到Supabase的脚本
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Supabase配置
const supabaseUrl = 'https://ehrguihgoswxdhncmcnn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVocmd1aWhnb3N3eGRobmNtY25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNzI4NTAsImV4cCI6MjA3MTc0ODg1MH0.NVahIpHBJE0myzEh3XdvQxR6_yVLsEaZD6lknArQR4w';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUserSync() {
  console.log('=== 测试用户数据同步 ===\n');
  
  try {
    // 1. 测试数据库连接
    console.log('1. 测试数据库连接...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.log('❌ 数据库连接失败:', connectionError.message);
      return;
    }
    console.log('✅ 数据库连接成功\n');
    
    // 2. 查看现有用户
    console.log('2. 查看现有用户...');
    const { data: existingUsers, error: fetchError } = await supabase
      .from('users')
      .select('id, username, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (fetchError) {
      console.log('❌ 获取用户列表失败:', fetchError.message);
    } else {
      console.log(`📊 数据库中共有 ${existingUsers.length} 个用户:`);
      existingUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.username} (ID: ${user.id})`);
      });
    }
    console.log();
    
    // 3. 测试用户注册
    console.log('3. 测试用户注册...');
    const testUsername = `test_user_${Date.now()}`;
    const testPassword = 'test123456';
    const passwordHash = await bcrypt.hash(testPassword, 10);
    
    console.log(`   用户名: ${testUsername}`);
    console.log(`   密码哈希: ${passwordHash}`);
    
    const { data: newUser, error: registerError } = await supabase
      .from('users')
      .insert({
        username: testUsername,
        password_hash: passwordHash,
      })
      .select()
      .single();
    
    if (registerError) {
      console.log('❌ 用户注册失败:', registerError.message);
      return;
    }
    
    console.log('✅ 用户注册成功!');
    console.log(`   用户ID: ${newUser.id}`);
    console.log(`   创建时间: ${newUser.created_at}\n`);
    
    // 4. 测试用户登录验证
    console.log('4. 测试用户登录验证...');
    const { data: loginUser, error: loginError } = await supabase
      .from('users')
      .select('id, username, password_hash')
      .eq('username', testUsername)
      .single();
    
    if (loginError) {
      console.log('❌ 获取用户信息失败:', loginError.message);
      return;
    }
    
    const isPasswordValid = await bcrypt.compare(testPassword, loginUser.password_hash);
    console.log(`   密码验证结果: ${isPasswordValid ? '✅ 成功' : '❌ 失败'}\n`);
    
    // 5. 测试用户信息更新
    console.log('5. 测试用户信息更新...');
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        weight: 65,
        height: 170,
        age: 25,
        sweetness_preference: 'medium',
        favorite_brands: ['喜茶', '奈雪'],
        disliked_ingredients: ['珍珠'],
        updated_at: new Date().toISOString()
      })
      .eq('id', newUser.id)
      .select()
      .single();
    
    if (updateError) {
      console.log('❌ 用户信息更新失败:', updateError.message);
    } else {
      console.log('✅ 用户信息更新成功!');
      console.log(`   体重: ${updatedUser.weight}kg`);
      console.log(`   身高: ${updatedUser.height}cm`);
      console.log(`   甜度偏好: ${updatedUser.sweetness_preference}`);
      console.log(`   喜欢的品牌: ${updatedUser.favorite_brands?.join(', ')}`);
    }
    console.log();
    
    // 6. 清理测试数据
    console.log('6. 清理测试数据...');
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', newUser.id);
    
    if (deleteError) {
      console.log('❌ 清理测试数据失败:', deleteError.message);
    } else {
      console.log('✅ 测试数据清理完成\n');
    }
    
    console.log('=== 测试完成 ===');
    console.log('✅ 用户数据同步功能正常工作!');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
testUserSync();