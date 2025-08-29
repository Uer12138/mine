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

async function fixTeaRecordsTable() {
  try {
    console.log('🔧 修复 tea_records 表结构...');
    
    // 1. 检查当前表结构
    console.log('\n1. 检查当前 tea_records 表结构...');
    const { data: currentRecords, error: selectError } = await supabase
      .from('tea_records')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.log('❌ 查询 tea_records 表失败:', selectError.message);
      return;
    }
    
    console.log('✅ tea_records 表存在');
    
    // 2. 测试插入记录以检查字段
    console.log('\n2. 测试字段兼容性...');
    
    // 先创建一个测试用户
    const testUsername = `test_tea_${Date.now()}`;
    const { data: testUser, error: userError } = await supabase
      .from('users')
      .insert({
        username: testUsername,
        password_hash: 'test123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (userError) {
      console.log('❌ 创建测试用户失败:', userError.message);
      return;
    }
    
    console.log('✅ 测试用户创建成功');
    
    // 测试使用现有字段结构插入记录
    const testRecord = {
      user_id: testUser.id,
      tea_name: '测试奶茶',
      size: 'large',
      sweetness_level: 'medium',
      toppings: '珍珠',
      estimated_calories: 350,
      recorded_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    
    const { data: insertedRecord, error: insertError } = await supabase
      .from('tea_records')
      .insert(testRecord)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ 插入测试记录失败:', insertError.message);
    } else {
      console.log('✅ 使用现有字段结构插入成功');
      console.log('   - 奶茶名称:', insertedRecord.tea_name);
      console.log('   - 估算热量:', insertedRecord.estimated_calories);
    }
    
    // 3. 测试应用期望的字段结构
    console.log('\n3. 测试应用期望的字段结构...');
    
    const appExpectedRecord = {
      user_id: testUser.id,
      brand: '喜茶',
      product_name: '芝芝莓莓',
      sugar_level: 'medium',
      calories: 380,
      price: 28.00,
      created_at: new Date().toISOString()
    };
    
    const { data: appRecord, error: appError } = await supabase
      .from('tea_records')
      .insert(appExpectedRecord)
      .select()
      .single();
    
    if (appError) {
      console.log('❌ 使用应用期望字段插入失败:', appError.message);
      console.log('\n需要在 Supabase Dashboard 中执行以下 SQL 来添加缺失字段:');
      console.log('\n```sql');
      console.log('-- 添加应用需要的字段');
      console.log('ALTER TABLE tea_records ADD COLUMN IF NOT EXISTS brand VARCHAR(100);');
      console.log('ALTER TABLE tea_records ADD COLUMN IF NOT EXISTS product_name VARCHAR(100);');
      console.log('ALTER TABLE tea_records ADD COLUMN IF NOT EXISTS sugar_level VARCHAR(20);');
      console.log('ALTER TABLE tea_records ADD COLUMN IF NOT EXISTS calories INTEGER;');
      console.log('ALTER TABLE tea_records ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);');
      console.log('\n-- 可选：为了向后兼容，可以创建视图或者更新现有记录');
      console.log('-- UPDATE tea_records SET calories = estimated_calories WHERE calories IS NULL;');
      console.log('-- UPDATE tea_records SET brand = COALESCE(brand, \'未知品牌\') WHERE brand IS NULL;');
      console.log('-- UPDATE tea_records SET product_name = COALESCE(product_name, tea_name) WHERE product_name IS NULL;');
      console.log('```');
    } else {
      console.log('✅ 使用应用期望字段插入成功');
      console.log('   - 品牌:', appRecord.brand);
      console.log('   - 产品名称:', appRecord.product_name);
      console.log('   - 卡路里:', appRecord.calories);
    }
    
    // 4. 清理测试数据
    console.log('\n4. 清理测试数据...');
    
    // 删除测试记录
    if (insertedRecord) {
      await supabase.from('tea_records').delete().eq('id', insertedRecord.id);
    }
    if (appRecord) {
      await supabase.from('tea_records').delete().eq('id', appRecord.id);
    }
    
    // 删除测试用户
    await supabase.from('users').delete().eq('id', testUser.id);
    
    console.log('✅ 测试数据清理完成');
    
    console.log('\n📋 tea_records 表结构检查完成！');
    
  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error.message);
  }
}

// 运行修复
fixTeaRecordsTable();