const { exec } = require('child_process');
const fs = require('fs');
const logger = require('../src/utils/logger');

const romPath = process.argv[2];

if (!romPath || !fs.existsSync(romPath)) {
  console.error('❌ ROM file not found:', romPath);
  process.exit(1);
}

console.log('🔄 Flashing ROM:', romPath);

exec('adb reboot bootloader', () => {
  setTimeout(() => {
    exec(`fastboot flash boot ${romPath}`, (error) => {
      if (error) {
        console.error('❌ Flash failed:', error.message);
        process.exit(1);
      }
      console.log('✅ ROM flashed successfully');
      exec('fastboot reboot');
    });
  }, 3000);
});