const { execSync } = require('child_process');
const name = process.argv[2];
if (!name) {
  console.error('\n❌ Vui lòng nhập tên migration. \n👉 Ví dụ: yarn m:g CreateUser\n');
  process.exit(1);
}
console.log(`\n⏳ Đang sinh migration với tên: ${name}...\n`);
execSync(`yarn typeorm migration:generate -d src/database/data-source.ts src/database/migrations/${name}`, { stdio: 'inherit' });
