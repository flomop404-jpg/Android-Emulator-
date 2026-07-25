const Queue = require('bull');
const logger = require('../utils/logger');
const { executeAdbCommand } = require('../utils/adb');

const flashQueue = new Queue('rom-flash', process.env.REDIS_URL);

flashQueue.process(async (job) => {
  const { rom_path, partition } = job.data;
  
  try {
    logger.info(`Starting ROM flash: ${partition}`, { job_id: job.id });
    
    await executeAdbCommand('reboot bootloader', 5000);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await executeAdbCommand(`fastboot flash ${partition} ${rom_path}`, 120000);
    
    await executeAdbCommand('fastboot reboot', 5000);
    
    logger.info(`ROM flash completed: ${partition}`, { job_id: job.id });
    return { status: 'success', partition, rom_path };
  } catch (error) {
    logger.error(`ROM flash failed: ${error.message}`, { job_id: job.id });
    throw error;
  }
});

flashQueue.on('completed', (job) => {
  logger.info(`Job completed: ${job.id}`);
});

flashQueue.on('failed', (job, err) => {
  logger.error(`Job failed: ${job.id}`, err);
});

module.exports = { flashQueue };