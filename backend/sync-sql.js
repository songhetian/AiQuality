const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const prismaSchemaPath = path.join(__dirname, 'prisma/schema.prisma');
const sqlOutputPath = path.join(__dirname, '../schema.sql');

function syncSql() {
  console.log('检测到 Prisma Schema 变更，正在同步 schema.sql...');
  try {
    execSync(`npx prisma migrate diff --from-empty --to-schema ${prismaSchemaPath} --script > ${sqlOutputPath}`, {
      stdio: 'inherit',
    });
    console.log('✅ schema.sql 同步成功！');
  } catch (error) {
    console.error('❌ schema.sql 同步失败:', error.message);
  }
}

// 如果是直接运行脚本，则执行一次同步
if (require.main === module) {
  syncSql();
}

module.exports = syncSql;
