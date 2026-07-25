const { exec } = require('child_process');
const logger = require('../src/utils/logger');

setInterval(() => {
  exec('adb shell "cat /proc/stat"', (error, stdout) => {
    if (!error) {
      logger.info('📊 Emulator running', { timestamp: new Date().toLocaleTimeString() });
    }
  });
}, 5000);