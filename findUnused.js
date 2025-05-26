const fs = require('fs');
const path = require('path');

const projectDir = __dirname;
const essentialFiles = [
  'index.html', 'admin.html', 'admin-console.html', 'style.css',
  'app.js', 'admin.js', 'server.js', 'db.js', 'package.json', 
  'package-lock.json', 'hall_booking.db', 'findUnused.js'
];

const essentialDirs = [
  'node_modules', 'scripts', 'backups', 'logs'
];

console.log('🔍 Scanning for unused files...\n');

fs.readdir(projectDir, { withFileTypes: true }, (err, entries) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  const unusedFiles = [];
  const unusedDirs = [];

  entries.forEach(entry => {
    if (entry.isFile()) {
      if (!essentialFiles.includes(entry.name)) {
        const filePath = path.join(projectDir, entry.name);
        const stats = fs.statSync(filePath);
        unusedFiles.push({
          name: entry.name,
          size: stats.size,
          modified: stats.mtime
        });
      }
    } else if (entry.isDirectory()) {
      if (!essentialDirs.includes(entry.name)) {
        unusedDirs.push(entry.name);
      }
    }
  });

  if (unusedFiles.length > 0) {
    console.log('❌ UNUSED FILES (consider deleting):');
    unusedFiles.forEach(file => {
      console.log(`   ${file.name} (${file.size} bytes, modified: ${file.modified.toDateString()})`);
    });
  } else {
    console.log('✅ No unused files found!');
  }

  if (unusedDirs.length > 0) {
    console.log('\n❌ UNUSED DIRECTORIES (consider deleting):');
    unusedDirs.forEach(dir => {
      console.log(`   ${dir}/`);
    });
  } else {
    console.log('\n✅ No unused directories found!');
  }

  console.log('\n📋 SUMMARY:');
  console.log(`   Essential files: ${essentialFiles.length - 1}`); // -1 for findUnused.js
  console.log(`   Essential directories: ${essentialDirs.length}`);
  console.log(`   Unused files: ${unusedFiles.length}`);
  console.log(`   Unused directories: ${unusedDirs.length}`);
});