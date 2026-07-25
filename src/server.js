const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const helmet = require('helmet');
const cors = require('cors');
const logger = require('./utils/logger');
const { getDeviceStatus, executeAdbCommand } = require('./utils/adb');
const { flashQueue } = require('./queue/jobs');
const db = require('./db/database');
const vncRoutes = require('./routes/vnc');

require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  message: 'Too many requests, please try again later'
});
app.use('/api/', limiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { ip: req.ip });
  next();
});

// ============ VALIDATION ============

const validateFlashRequest = [
  body('rom_path').notEmpty().withMessage('rom_path is required').isString(),
  body('partition').notEmpty().withMessage('partition is required').isString()
];

const validateShellCommand = [
  body('command').notEmpty().withMessage('command is required').isString()
];

const validateAppInstall = [
  body('apk_path').notEmpty().withMessage('apk_path is required').isString()
];

const validateAppUninstall = [
  body('package_name').notEmpty().withMessage('package_name is required').isString()
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn(`Validation failed for ${req.path}`, { errors: errors.array() });
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// ============ HEALTH & STATUS ============

app.get('/api/health', async (req, res) => {
  try {
    const status = await getDeviceStatus();
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      emulator: status,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});

app.get('/api/emulator/status', async (req, res) => {
  try {
    const status = await getDeviceStatus();
    res.json({ status, timestamp: new Date() });
  } catch (error) {
    logger.error('Failed to get emulator status', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ EMULATOR CONTROL ============

app.post('/api/emulator/boot', async (req, res) => {
  try {
    logger.info('Boot request received');
    res.json({ status: 'booting' });
  } catch (error) {
    logger.error('Boot failed', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/emulator/reboot', async (req, res) => {
  try {
    await executeAdbCommand('reboot', 30000);
    logger.info('Emulator rebooted');
    res.json({ status: 'rebooting' });
  } catch (error) {
    logger.error('Reboot failed', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ ROM FLASHING ============

app.post('/api/rom/flash', validateFlashRequest, handleValidationErrors, async (req, res) => {
  try {
    const { rom_path, partition } = req.body;
    
    const job = await flashQueue.add({ rom_path, partition }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: true
    });

    logger.info(`Flash job queued: ${job.id}`, { rom_path, partition });

    db.run(
      `INSERT INTO tasks (task_id, type, status, rom_path, partition) VALUES (?, ?, ?, ?, ?)`,
      [job.id, 'flash', 'pending', rom_path, partition],
      (err) => {
        if (err) logger.error('Failed to save task to database', err);
      }
    );

    res.json({ 
      job_id: job.id, 
      status: 'queued',
      rom_path,
      partition
    });
  } catch (error) {
    logger.error('Flash request failed', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/rom/flash/:job_id', async (req, res) => {
  try {
    const job = await flashQueue.getJob(req.params.job_id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const state = await job.getState();
    const progress = job._progress;

    res.json({
      job_id: job.id,
      status: state,
      progress,
      data: job.data
    });
  } catch (error) {
    logger.error('Failed to get job status', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ SHELL COMMANDS ============

app.post('/api/shell', validateShellCommand, handleValidationErrors, async (req, res) => {
  try {
    const { command } = req.body;
    
    const dangerousCommands = ['rm -rf', 'dd if=', 'mkfs'];
    if (dangerousCommands.some(cmd => command.includes(cmd))) {
      logger.warn(`Dangerous command rejected: ${command}`);
      return res.status(403).json({ error: 'Command not allowed' });
    }

    const output = await executeAdbCommand(`shell "${command}"`, 30000);
    
    logger.info(`Shell command executed: ${command}`);
    res.json({ command, output });
  } catch (error) {
    logger.error('Shell command failed', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ APP MANAGEMENT ============

app.post('/api/app/install', validateAppInstall, handleValidationErrors, async (req, res) => {
  try {
    const { apk_path } = req.body;
    const output = await executeAdbCommand(`install ${apk_path}`, 60000);
    logger.info(`APK installed: ${apk_path}`);
    res.json({ status: 'installing', output });
  } catch (error) {
    logger.error('App install failed', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/app/uninstall', validateAppUninstall, handleValidationErrors, async (req, res) => {
  try {
    const { package_name } = req.body;
    const output = await executeAdbCommand(`uninstall ${package_name}`, 30000);
    logger.info(`App uninstalled: ${package_name}`);
    res.json({ status: 'uninstalled', output });
  } catch (error) {
    logger.error('App uninstall failed', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ FILE TRANSFER ============

app.post('/api/files/push', async (req, res) => {
  try {
    const { local_path, remote_path } = req.body;
    const output = await executeAdbCommand(`push ${local_path} ${remote_path}`, 60000);
    logger.info(`File pushed: ${local_path} -> ${remote_path}`);
    res.json({ status: 'pushed', output });
  } catch (error) {
    logger.error('File push failed', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/files/pull', async (req, res) => {
  try {
    const { remote_path, local_path } = req.query;
    const output = await executeAdbCommand(`pull ${remote_path} ${local_path}`, 60000);
    logger.info(`File pulled: ${remote_path} -> ${local_path}`);
    res.json({ status: 'pulled', output });
  } catch (error) {
    logger.error('File pull failed', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ VNC ROUTES ============

app.use('/api/vnc', vncRoutes);

// ============ SYSTEM INFO ============

app.get('/api/system/info', async (req, res) => {
  try {
    const version = await executeAdbCommand('shell getprop ro.build.version.release', 5000);
    const model = await executeAdbCommand('shell getprop ro.product.model', 5000);
    res.json({
      android_version: version.trim(),
      device_model: model.trim(),
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Failed to get system info', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ ERROR HANDLING ============

app.use((err, req, res, next) => {
  logger.error('Unhandled error', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ============ STARTUP ============

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server started on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

module.exports = app;