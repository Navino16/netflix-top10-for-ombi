import {
  createLogger, format, Logger, transports,
} from 'winston';

const myFormat = format.printf((info) => `[${info.timestamp}][${info.level}] ${info.message}`);

const logger: Logger = createLogger({
  format: format.combine(
    format.colorize(),
    format.splat(),
    format.simple(),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    myFormat,
  ),
  level: 'info',
  transports: [
    new transports.Console(),
  ],
});

export const AppLogger = logger;
