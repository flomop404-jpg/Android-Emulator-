const { exec } = require('child_process');
const logger = require('./logger');

const executeAdbCommand = (command, timeout = 30000) => {
  return new Promise((resolve, reject) => {
    const fullCommand = command.startsWith('fastboot') 
      ? command 
      : `adb ${command}`;

    const process = exec(fullCommand, { timeout }, (error, stdout, stderr) => {
      if (error) {
        logger.error(`ADB command failed: ${command}`, { error: error.message });
        reject(new Error(`ADB failed: ${stderr || error.message}`));
      } else {
        logger.debug(`ADB command succeeded: ${command}`);
        resolve(stdout);
      }
    });

    setTimeout(() => {
      if (!process.killed) {
        process.kill();
        logger.warn(`Command timeout: ${command}`);
        reject(new Error(`Command timeout after ${timeout}ms`));
      }
    }, timeout);
  });
};

const getDeviceStatus = async () => {
  try {
    const output = await executeAdbCommand('devices', 5000);
    return output.includes('device') ? 'connected' : 'offline';
  } catch (error) {
    return 'offline';
  }
};

module.exports = { executeAdbCommand, getDeviceStatus };