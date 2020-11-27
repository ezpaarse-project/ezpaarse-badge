const winston = require('winston');

const { format } = winston;
module.exports = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
  ),
  transports: [new (winston.transports.Console)()],
});
