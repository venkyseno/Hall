const fs = require('fs');
const path = require('path');

const sourceDB = path.join(__dirname, '../hall_booking.db');
const backupDir = path.join(__dirname, '../backups');

// Check if source database exists
if (!fs.existsSync(sourceDB)) {
  console.error('Database file not found:', sourceDB);
  process.exit(1);
}

// Ensure backup directory exists
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
  console.log('Created backups directory');
}

// Create backup with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const backupFile = path.join(backupDir, `backup_${timestamp}.db`);

try {
  fs.copyFileSync(sourceDB, backupFile);
  console.log(`✅ Database backed up successfully!`);
  console.log(`📁 Backup location: ${backupFile}`);
  
  // Get file size
  const stats = fs.statSync(backupFile);
  console.log(`📊 Backup size: ${(stats.size / 1024).toFixed(2)} KB`);
  
  // Clean old backups (keep last 10)
  const backups = fs.readdirSync(backupDir)
    .filter(file => file.startsWith('backup_') && file.endsWith('.db'))
    .map(file => ({
      name: file,
      path: path.join(backupDir, file),
      time: fs.statSync(path.join(backupDir, file)).mtime
    }))
    .sort((a, b) => b.time - a.time);

  if (backups.length > 10) {
    const toDelete = backups.slice(10);
    toDelete.forEach(backup => {
      fs.unlinkSync(backup.path);
      console.log(`🗑️  Deleted old backup: ${backup.name}`);
    });
  }
  
  console.log(`📚 Total backups: ${Math.min(backups.length, 10)}`);
  
} catch (error) {
  console.error('❌ Backup failed:', error.message);
  process.exit(1);
}