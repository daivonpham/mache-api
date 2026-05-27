const { execSync } = require('child_process');
const name = process.argv[2];
if (!name) {
  console.error('\n❌ Vui lòng nhập tên migration. \n👉 Ví dụ: yarn m:c CreateUser\n');
  process.exit(1);
}
console.log(`\n⏳ Đang tạo file migration trống với tên: ${name}...\n`);
execSync(`yarn typeorm migration:create src/database/migrations/${name}`, { stdio: 'inherit' });
