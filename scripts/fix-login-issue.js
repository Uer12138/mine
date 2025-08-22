// 快速修复登录问题的脚本
// 在浏览器控制台中运行此脚本来修复登录问题

console.log("=== TeaCal 登录问题修复工具 ===");

// 检查并修复用户数据
function fixUserData() {
  console.log("\n1. 检查用户数据...");
  
  const users = JSON.parse(localStorage.getItem("teacal_users") || "[]");
  console.log("当前用户数量:", users.length);
  
  if (users.length === 0) {
    console.log("❌ 没有用户数据，请先注册");
    return false;
  }
  
  // 检查每个用户的密码哈希
  let hasIssues = false;
  users.forEach((user, index) => {
    if (!user.password_hash || user.password_hash.length !== 8) {
      console.log(`⚠️ 用户 ${user.username} 的密码哈希有问题:`, user.password_hash);
      hasIssues = true;
    }
  });
  
  if (hasIssues) {
    console.log("\n2. 检测到密码哈希问题，正在修复...");
    
    // 清除有问题的数据
    localStorage.removeItem("teacal_users");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("tempUserId");
    
    console.log("✅ 已清除有问题的用户数据");
    console.log("请重新注册用户");
    return false;
  }
  
  console.log("✅ 用户数据正常");
  return true;
}

// 重新生成用户密码哈希
async function regeneratePasswordHash(username, password) {
  console.log(`\n重新生成用户 ${username} 的密码哈希...`);
  
  // 使用与 auth.ts 相同的哈希算法
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  const shortHash = hashHex.substring(0, 8);
  
  console.log("新密码哈希:", shortHash);
  return shortHash;
}

// 修复特定用户的密码
async function fixUserPassword(username, password) {
  console.log(`\n修复用户 ${username} 的密码...`);
  
  const users = JSON.parse(localStorage.getItem("teacal_users") || "[]");
  const userIndex = users.findIndex(u => u.username === username);
  
  if (userIndex === -1) {
    console.log("❌ 用户不存在");
    return false;
  }
  
  const newHash = await regeneratePasswordHash(username, password);
  users[userIndex].password_hash = newHash;
  users[userIndex].updated_at = new Date().toISOString();
  
  localStorage.setItem("teacal_users", JSON.stringify(users));
  console.log("✅ 密码已修复");
  
  return true;
}

// 测试登录
async function testLogin(username, password) {
  console.log(`\n测试用户 ${username} 的登录...`);
  
  const users = JSON.parse(localStorage.getItem("teacal_users") || "[]");
  const user = users.find(u => u.username === username);
  
  if (!user) {
    console.log("❌ 用户不存在");
    return false;
  }
  
  const newHash = await regeneratePasswordHash(username, password);
  
  if (user.password_hash === newHash) {
    console.log("✅ 登录测试成功");
    return true;
  } else {
    console.log("❌ 登录测试失败");
    console.log("存储的哈希:", user.password_hash);
    console.log("输入的哈希:", newHash);
    return false;
  }
}

// 导出函数
window.fixLogin = {
  fixUserData,
  regeneratePasswordHash,
  fixUserPassword,
  testLogin
};

console.log("\n使用方法:");
console.log("- fixLogin.fixUserData() - 检查并修复用户数据");
console.log("- fixLogin.fixUserPassword('用户名', '密码') - 修复特定用户的密码");
console.log("- fixLogin.testLogin('用户名', '密码') - 测试登录");
console.log("- fixLogin.regeneratePasswordHash('用户名', '密码') - 重新生成密码哈希");

// 自动运行检查
fixUserData();
