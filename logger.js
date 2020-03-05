const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
});

if (process.env.NODE_ENV === 'production') {
    logger.add(new winston.transports.File({
        filename: process.env.CRESS_ERROR_FILE,
        timestamp: true,
        level: 'error'
    }));
    logger.add(new winston.transports.File({
        filename: process.env.CRESS_COMBINED_FILE,
        timestamp: true
    }));
}
else {
    logger.add(new winston.transports.Console({timestamp: true}));
}

logger.stream = {
    write: (message, _encoding) => {
        logger.info(message);
    }
}

module.exports = logger;
