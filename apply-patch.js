// 这个脚本用于手动应用 @radix-ui/react-select 的补丁
const fs = require('fs');
const path = require('path');

// 读取补丁文件
const patchFile = path.join(__dirname, 'patches', '@radix-ui+react-select+2.1.3.patch');
const patchContent = fs.readFileSync(patchFile, 'utf8');

// 解析补丁文件
const lines = patchContent.split('\n');
const targetFileLine = lines.find(line => line.startsWith('+++ b/'));
if (!targetFileLine) {
  console.error('无法找到目标文件路径');
  process.exit(1);
}

const targetFilePath = targetFileLine.replace('+++ b/', '');
const fullTargetPath = path.join(__dirname, targetFilePath);

// 读取目标文件
let fileContent = fs.readFileSync(fullTargetPath, 'utf8');

// 应用补丁
const hunks = patchContent.split('@@ ').slice(1);
for (const hunk of hunks) {
  const hunkLines = hunk.split('\n');
  const headerLine = hunkLines[0];
  const [oldRange, newRange] = headerLine.split(' ');
  const [oldStart, oldCount] = oldRange.replace('-', '').split(',');
  const [newStart, newCount] = newRange.replace('+', '').split(',');

  const oldStartNum = parseInt(oldStart, 10);
  const oldCountNum = oldCount ? parseInt(oldCount, 10) : 1;
  const newStartNum = parseInt(newStart, 10);
  const newCountNum = newCount ? parseInt(newCount, 10) : 1;

  const fileLines = fileContent.split('\n');
  const oldLines = fileLines.slice(oldStartNum - 1, oldStartNum - 1 + oldCountNum);

  // 查找要替换的行
  let matchIndex = -1;
  for (let i = 0; i <= fileLines.length - oldLines.length; i++) {
    let match = true;
    for (let j = 0; j < oldLines.length; j++) {
      if (fileLines[i + j] !== oldLines[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      matchIndex = i;
      break;
    }
  }

  if (matchIndex === -1) {
    console.error(`无法找到要替换的行: ${oldLines.join('\n')}`);
    continue;
  }

  // 提取新行
  const newLines = [];
  for (let i = 1; i < hunkLines.length; i++) {
    const line = hunkLines[i];
    if (line.startsWith('+')) {
      newLines.push(line.slice(1));
    } else if (!line.startsWith('-') && line) {
      newLines.push(line);
    }
  }

  // 替换行
  fileLines.splice(matchIndex, oldLines.length, ...newLines);
  fileContent = fileLines.join('\n');
}

// 写入修改后的文件
fs.writeFileSync(fullTargetPath, fileContent, 'utf8');
console.log('补丁应用成功!');