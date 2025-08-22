// 认证调试脚本
// 在浏览器控制台中运行此脚本来诊断认证问题

console.log("=== TeaCal 认证调试工具 ===");

// 检查当前存储的用户数据
function checkStoredUsers() {
  console.log("\n1. 检查本地存储的用户数据:");
  const users = JSON.parse(localStorage.getItem("teacal_users") || "[]");
  console.log("用户总数:", users.length);
  
  if (users.length === 0) {
    console.log("❌ 没有找到任何用户数据");
    return;
  }
  
  users.forEach((user, index) => {
    console.log(`用户 ${index + 1}:`, {
      id: user.id,
      username: user.username,
      passwordHash: user.password_hash,
      hashLength: user.password_hash?.length || 0,
      createdAt: user.created_at
    });
  });
}

// 检查当前登录状态
function checkLoginStatus() {
  console.log("\n2. 检查当前登录状态:");
  const currentUser = localStorage.getItem("currentUser");
  if (currentUser) {
    const user = JSON.parse(currentUser);
    console.log("✅ 当前登录用户:", user.username);
  } else {
    console.log("❌ 当前没有用户登录");
  }
}

// 测试密码哈希函数
async function testPasswordHash(password) {
  console.log("\n3. 测试密码哈希:");
  console.log("原始密码:", password);
  
  // 模拟 md5 函数的简化版本
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  const shortHash = hashHex.substring(0, 8);
  
  console.log("生成的哈希值:", shortHash);
  console.log("哈希长度:", shortHash.length);
  
  return shortHash;
}

// 模拟登录过程
async function simulateLogin(username, password) {
  console.log("\n4. 模拟登录过程:");
  console.log("用户名:", username);
  console.log("密码:", password);
  
  const users = JSON.parse(localStorage.getItem("teacal_users") || "[]");
  const userExists = users.find(u => u.username === username);
  
  if (!userExists) {
    console.log("❌ 用户不存在");
    return false;
  }
  
  console.log("✅ 用户存在");
  const passwordHash = await testPasswordHash(password);
  
  if (userExists.password_hash === passwordHash) {
    console.log("✅ 密码匹配，登录成功");
    return true;
  } else {
    console.log("❌ 密码不匹配");
    console.log("存储的哈希:", userExists.password_hash);
    console.log("输入的哈希:", passwordHash);
    return false;
  }
}

// 清除所有数据（谨慎使用）
function clearAllData() {
  console.log("\n⚠️ 清除所有数据:");
  localStorage.removeItem("teacal_users");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("tempUserId");
  console.log("✅ 所有用户数据已清除");
}

// 运行所有检查
async function runAllChecks() {
  checkStoredUsers();
  checkLoginStatus();
  
  // 如果有用户数据，测试第一个用户的登录
  const users = JSON.parse(localStorage.getItem("teacal_users") || "[]");
  if (users.length > 0) {
    const firstUser = users[0];
    console.log(`\n5. 测试用户 "${firstUser.username}" 的登录:`);
    await simulateLogin(firstUser.username, "test123"); // 使用测试密码
  }
}

// 导出函数供控制台使用
window.debugAuth = {
  checkStoredUsers,
  checkLoginStatus,
  testPasswordHash,
  simulateLogin,
  clearAllData,
  runAllChecks
};

console.log("\n使用方法:");
console.log("- debugAuth.runAllChecks() - 运行所有检查");
console.log("- debugAuth.checkStoredUsers() - 检查用户数据");
console.log("- debugAuth.simulateLogin('用户名', '密码') - 模拟登录");
console.log("- debugAuth.clearAllData() - 清除所有数据（谨慎使用）");

// 自动运行检查
runAllChecks();
