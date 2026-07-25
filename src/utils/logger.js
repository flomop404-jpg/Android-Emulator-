const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'emulator-backend' },
  transports: [
    new winston.transports.File({ 
      filename: path.join('/var/log/emulator', 'error.log'),
      level: 'error',
      maxsize: 10485760,
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: path.join('/var/log/emulator', 'combined.log'),
      maxsize: 10485760,
      maxFiles: 5
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          info => `${info.timestamp} [${info.level}]: ${info.message}`
        )
      )
    })
  ]
});

module.exports = logger;