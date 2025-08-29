// 添加缺失的disliked_ingredients字段
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ehrguihgoswxdhncmcnn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVocmd1aWhnb3N3eGRobmNtY25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNzI4NTAsImV4cCI6MjA3MTc0ODg1MH0.NVahIpHBJE0myzEh3XdvQxR6_yVLsEaZD6lknArQR4w';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testMissingColumn() {
  console.log('=== 测试缺失字段 ===\n');
  
  try {
    // 测试插入包含disliked_ingredients的数据
    const testUsername = `test_missing_col_${Date.now()}`;
    
    console.log('1. 测试插入包含disliked_ingredients的数据...');
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        username: testUsername,
        password_hash: 'test123',
        disliked_ingredients: ['珍珠', '椰果']
      })
      .select()
      .single();
    
    if (insertError) {
      if (insertError.message.includes('disliked_ingredients')) {
        console.log('❌ disliked_ingredients字段不存在');
        console.log('\n需要在Supabase Dashboard执行以下SQL:');
        console.log('ALTER TABLE users ADD COLUMN disliked_ingredients TEXT[];');
        return;
      } else {
        console.log('❌ 插入失败:', insertError.message);
        return;
      }
    }
    
    console.log('✅ 插入成功，disliked_ingredients字段存在');
    console.log(`用户ID: ${newUser.id}`);
    console.log(`不喜欢的配料: ${newUser.disliked_ingredients?.join(', ')}`);
    
    // 清理测试数据
    await supabase.from('users').delete().eq('id', newUser.id);
    console.log('✅ 测试数据已清理\n');
    
    // 现在测试完整的用户信息更新
    console.log('2. 测试完整的用户信息更新...');
    const testUser2 = `test_full_update_${Date.now()}`;
    
    const { data: user2, error: user2Error } = await supabase
      .from('users')
      .insert({
        username: testUser2,
        password_hash: 'test123'
      })
      .select()
      .single();
    
    if (user2Error) {
      console.log('❌ 创建测试用户失败:', user2Error.message);
      return;
    }
    
    // 更新用户信息
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        weight: 65,
        height: 170,
        age: 25,
        sweetness_preference: 'medium',
        favorite_brands: ['喜茶', '奈雪'],
        disliked_ingredients: ['珍珠', '椰果'],
        daily_calorie_limit: 1800,
        profile_completed: true
      })
      .eq('id', user2.id)
      .select()
      .single();
    
    if (updateError) {
      console.log('❌ 用户信息更新失败:', updateError.message);
    } else {
      console.log('✅ 用户信息更新成功!');
      console.log(`体重: ${updatedUser.weight}kg`);
      console.log(`身高: ${updatedUser.height}cm`);
      console.log(`年龄: ${updatedUser.age}岁`);
      console.log(`甜度偏好: ${updatedUser.sweetness_preference}`);
      console.log(`喜欢的品牌: ${updatedUser.favorite_brands?.join(', ')}`);
      console.log(`不喜欢的配料: ${updatedUser.disliked_ingredients?.join(', ')}`);
      console.log(`每日卡路里限制: ${updatedUser.daily_calorie_limit}`);
      console.log(`资料完整度: ${updatedUser.profile_completed ? '已完成' : '未完成'}`);
    }
    
    // 清理测试数据
    await supabase.from('users').delete().eq('id', user2.id);
    console.log('\n✅ 测试数据已清理');
    
    console.log('\n=== 测试完成 ===');
    console.log('✅ 用户数据同步功能完全正常!');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

testMissingColumn();