const express = require('express');
const { executeAdbCommand } = require('../utils/adb');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/status', async (req, res) => {
  try {
    const output = await executeAdbCommand('devices', 5000);
    res.json({
      vnc_running: true,
      ports: { vnc: 5900, novnc: 6080 },
      access: {
        vnc_viewer: 'localhost:5900',
        browser: 'http://localhost:6080'
      }
    });
  } catch (error) {
    logger.error('VNC status check failed', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/restart', (req, res) => {
  const { exec } = require('child_process');
  exec('supervisorctl restart vnc', (error) => {
    if (error) {
      logger.error('VNC restart failed', error);
      return res.status(500).json({ error: error.message });
    }
    logger.info('VNC restarted');
    res.json({ status: 'VNC restarted' });
  });
});

router.get('/resolution', (req, res) => {
  res.json({
    resolution: '1280x720',
    display: ':99',
    bpp: '24-bit'
  });
});

module.exports = router;