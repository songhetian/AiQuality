#!/usr/bin/env node

/**
 * 环境变量配置测试脚本
 * 用于验证后端能否正确读取根目录的 .env 文件
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

console.log("\n✅ 环境变量配置测试\n");
console.log("=".repeat(50));

const tests = [
  { name: "NODE_ENV", value: process.env.NODE_ENV },
  { name: "PORT", value: process.env.PORT },
  { name: "DB_HOST", value: process.env.DB_HOST },
  { name: "DB_PORT", value: process.env.DB_PORT },
  { name: "DB_USER", value: process.env.DB_USER },
  { name: "DB_NAME", value: process.env.DB_NAME },
  {
    name: "DATABASE_URL",
    value: process.env.DATABASE_URL ? "✓ 已配置" : "✗ 未配置",
  },
  { name: "REDIS_HOST", value: process.env.REDIS_HOST },
  { name: "REDIS_PORT", value: process.env.REDIS_PORT },
  { name: "QDRANT_URL", value: process.env.QDRANT_URL },
  { name: "MINIO_ENDPOINT", value: process.env.MINIO_ENDPOINT },
  { name: "MINIO_BUCKET", value: process.env.MINIO_BUCKET },
];

let allPassed = true;

tests.forEach(({ name, value }) => {
  const status = value ? "✅" : "❌";
  if (!value) allPassed = false;
  console.log(`${status} ${name.padEnd(20)} : ${value || "⚠️  未配置"}`);
});

console.log("=".repeat(50));

if (allPassed) {
  console.log("\n🎉 所有环境变量配置正常！\n");
  process.exit(0);
} else {
  console.log("\n⚠️  部分环境变量未配置，请检查 /.env 文件\n");
  process.exit(1);
}
