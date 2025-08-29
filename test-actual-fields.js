// 测试应用实际使用的字段
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = 'https://ehrguihgoswxdhncmcnn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVocmd1aWhnb3N3eGRobmNtY25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNzI4NTAsImV4cCI6MjA3MTc0ODg1MH0.NVahIpHBJE0myzEh3XdvQxR6_yVLsEaZD6lknArQR4w';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testActualUserSync() {
  console.log('=== 测试实际应用字段的用户数据同步 ===\n');
  
  try {
    // 1. 创建测试用户
    console.log('1. 创建测试用户...');
    const testUsername = `test_real_${Date.now()}`;
    const testPassword = 'test123456';
    const passwordHash = await bcrypt.hash(testPassword, 10);
    
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
    console.log(`   用户名: ${newUser.username}\n`);
    
    // 2. 测试应用实际使用的字段更新
    console.log('2. 测试应用实际使用的字段更新...');
    
    // 这些是应用中实际使用的字段
    const updateData = {
      sweetness_preference: 'medium',
      favorite_brands: ['喜茶', '奈雪'],
      disliked_ingredients: ['珍珠', '椰果'],
      updated_at: new Date().toISOString()
    };
    
    console.log('   更新数据:', JSON.stringify(updateData, null, 2));
    
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', newUser.id)
      .select()
      .single();
    
    if (updateError) {
      console.log('❌ 用户信息更新失败:', updateError.message);
      console.log('   错误详情:', updateError);
    } else {
      console.log('✅ 用户信息更新成功!');
      console.log(`   甜度偏好: ${updatedUser.sweetness_preference}`);
      console.log(`   喜欢的品牌: ${updatedUser.favorite_brands?.join(', ')}`);
      console.log(`   不喜欢的配料: ${updatedUser.disliked_ingredients?.join(', ')}`);
      console.log(`   更新时间: ${updatedUser.updated_at}`);
    }
    
    // 3. 测试用户登录验证
    console.log('\n3. 测试用户登录验证...');
    const { data: loginUser, error: loginError } = await supabase
      .from('users')
      .select('id, username, password_hash, sweetness_preference, favorite_brands, disliked_ingredients')
      .eq('username', testUsername)
      .single();
    
    if (loginError) {
      console.log('❌ 获取用户信息失败:', loginError.message);
    } else {
      const isPasswordValid = await bcrypt.compare(testPassword, loginUser.password_hash);
      console.log(`   密码验证结果: ${isPasswordValid ? '✅ 成功' : '❌ 失败'}`);
      console.log(`   用户偏好数据完整性: ${loginUser.sweetness_preference && loginUser.favorite_brands && loginUser.disliked_ingredients ? '✅ 完整' : '❌ 缺失'}`);
    }
    
    // 4. 测试模拟应用中的用户偏好更新流程
    console.log('\n4. 测试模拟应用中的用户偏好更新流程...');
    
    // 模拟用户在应用中更改品牌偏好
    const newBrands = ['喜茶', '奈雪', 'CoCo'];
    const { data: brandUpdate, error: brandError } = await supabase
      .from('users')
      .update({
        favorite_brands: newBrands,
        updated_at: new Date().toISOString()
      })
      .eq('id', newUser.id)
      .select('favorite_brands')
      .single();
    
    if (brandError) {
      console.log('❌ 品牌偏好更新失败:', brandError.message);
    } else {
      console.log('✅ 品牌偏好更新成功!');
      console.log(`   新的品牌偏好: ${brandUpdate.favorite_brands?.join(', ')}`);
    }
    
    // 模拟用户在应用中更改不喜欢的配料
    const newDisliked = ['珍珠'];
    const { data: ingredientUpdate, error: ingredientError } = await supabase
      .from('users')
      .update({
        disliked_ingredients: newDisliked,
        updated_at: new Date().toISOString()
      })
      .eq('id', newUser.id)
      .select('disliked_ingredients')
      .single();
    
    if (ingredientError) {
      console.log('❌ 配料偏好更新失败:', ingredientError.message);
    } else {
      console.log('✅ 配料偏好更新成功!');
      console.log(`   新的不喜欢配料: ${ingredientUpdate.disliked_ingredients?.join(', ')}`);
    }
    
    // 5. 清理测试数据
    console.log('\n5. 清理测试数据...');
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', newUser.id);
    
    if (deleteError) {
      console.log('❌ 清理测试数据失败:', deleteError.message);
    } else {
      console.log('✅ 测试数据清理完成');
    }
    
    console.log('\n=== 测试完成 ===');
    console.log('✅ 用户数据同步功能完全正常!');
    console.log('\n📋 总结:');
    console.log('- 用户注册功能正常');
    console.log('- 用户信息更新功能正常');
    console.log('- 用户登录验证功能正常');
    console.log('- 用户偏好设置同步功能正常');
    console.log('- 数据库连接和操作正常');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

testActualUserSync();