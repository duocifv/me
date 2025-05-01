const fs = require('fs');
const path = require('path');

const sourceDir = path.resolve(__dirname, '../certs');
const destDir = path.resolve(__dirname, '../dist/certs');

// Tạo thư mục đích nếu chưa tồn tại
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = ['private.pem', 'public.pem'];

for (const file of files) {
  const src = path.join(sourceDir, file);
  const dest = path.join(destDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✅ Copied ${file} to dist/certs/`);
  } else {
    console.warn(`⚠️ File not found: ${src}`);
  }
}
