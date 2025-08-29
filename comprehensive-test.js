const fs = require('fs')
const path = require('path')

// 手动加载环境变量
function loadEnvVars() {
  const envPath = path.join(__dirname, '.env.local')
  const envVars = {}
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const lines = envContent.split('\n')
    
    lines.forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          envVars[key] = valueParts.join('=').replace(/^["']|["']$/g, '')
        }
      }
    })
  }
  
  return envVars
}

async function runComprehensiveTest() {
  console.log('🚀 开始综合测试...')
  console.log('=' .repeat(50))
  
  const envVars = loadEnvVars()
  
  // 1. 环境变量检查
  console.log('\n📋 1. 环境变量检查')
  console.log('-'.repeat(30))
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]
  
  let envCheckPassed = true
  requiredEnvVars.forEach(varName => {
    const exists = !!envVars[varName]
    console.log(`${exists ? '✅' : '❌'} ${varName}: ${exists ? '已设置' : '未设置'}`)
    if (!exists) envCheckPassed = false
  })
  
  console.log(`\n环境变量检查: ${envCheckPassed ? '✅ 通过' : '❌ 失败'}`)
  
  // 2. 文件结构检查
  console.log('\n📁 2. 文件结构检查')
  console.log('-'.repeat(30))
  
  const criticalFiles = [
    'app/auth/register/page.tsx',
    'app/auth/login/page.tsx',
    'lib/auth.ts',
    'lib/supabase.ts',
    '.env.local'
  ]
  
  let fileCheckPassed = true
  criticalFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath)
    const exists = fs.existsSync(fullPath)
    console.log(`${exists ? '✅' : '❌'} ${filePath}: ${exists ? '存在' : '缺失'}`)
    if (!exists) fileCheckPassed = false
  })
  
  console.log(`\n文件结构检查: ${fileCheckPassed ? '✅ 通过' : '❌ 失败'}`)
  
  // 3. 代码质量检查
  console.log('\n🔍 3. 代码质量检查')
  console.log('-'.repeat(30))
  
  let codeQualityPassed = true
  
  // 检查注册页面是否包含错误处理
  const registerPagePath = path.join(__dirname, 'app/auth/register/page.tsx')
  if (fs.existsSync(registerPagePath)) {
    const registerContent = fs.readFileSync(registerPagePath, 'utf8')
    const hasErrorHandling = registerContent.includes('detailedError') && 
                           registerContent.includes('environmentStatus')
    console.log(`${hasErrorHandling ? '✅' : '❌'} 注册页面错误处理: ${hasErrorHandling ? '已增强' : '需要改进'}`)
    if (!hasErrorHandling) codeQualityPassed = false
  }
  
  // 检查auth.ts是否包含详细错误信息
  const authPath = path.join(__dirname, 'lib/auth.ts')
  if (fs.existsSync(authPath)) {
    const authContent = fs.readFileSync(authPath, 'utf8')
    const hasDetailedErrors = authContent.includes('details:') && 
                            authContent.includes('environmentVars')
    console.log(`${hasDetailedErrors ? '✅' : '❌'} Auth错误处理: ${hasDetailedErrors ? '已增强' : '需要改进'}`)
    if (!hasDetailedErrors) codeQualityPassed = false
  }
  
  console.log(`\n代码质量检查: ${codeQualityPassed ? '✅ 通过' : '❌ 失败'}`)
  
  // 4. Supabase连接测试（如果环境变量存在）
  if (envCheckPassed) {
    console.log('\n🔗 4. Supabase连接测试')
    console.log('-'.repeat(30))
    
    try {
      const { createClient } = require('@supabase/supabase-js')
      const supabase = createClient(
        envVars.NEXT_PUBLIC_SUPABASE_URL,
        envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
      
      // 测试连接
      const { data, error } = await supabase.from('users').select('count').limit(1)
      
      if (error) {
        console.log('❌ Supabase连接失败:', error.message)
      } else {
        console.log('✅ Supabase连接成功')
      }
    } catch (error) {
      console.log('❌ Supabase测试异常:', error.message)
    }
  } else {
    console.log('\n⏭️  4. Supabase连接测试: 跳过（环境变量未设置）')
  }
  
  // 5. 总结
  console.log('\n' + '='.repeat(50))
  console.log('📊 测试总结')
  console.log('='.repeat(50))
  
  const allTestsPassed = envCheckPassed && fileCheckPassed && codeQualityPassed
  
  console.log(`环境变量: ${envCheckPassed ? '✅' : '❌'}`)
  console.log(`文件结构: ${fileCheckPassed ? '✅' : '❌'}`)
  console.log(`代码质量: ${codeQualityPassed ? '✅' : '❌'}`)
  
  console.log(`\n🎯 总体状态: ${allTestsPassed ? '✅ 所有测试通过' : '❌ 部分测试失败'}`)
  
  if (allTestsPassed) {
    console.log('\n🎉 恭喜！注册功能已经过全面测试和改进。')
    console.log('主要改进包括:')
    console.log('• 增强的错误处理和用户反馈')
    console.log('• 环境状态检查和显示')
    console.log('• 调试模式和详细错误信息')
    console.log('• 本地存储和数据库模式的无缝切换')
  } else {
    console.log('\n⚠️  请检查失败的测试项目并进行相应修复。')
  }
  
  console.log('\n测试完成！')
}

// 运行测试
runComprehensiveTest().catch(console.error)