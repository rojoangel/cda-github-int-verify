const validator = require('./validator');
const transformer = require('./transformer');
const sender = require('./sender');
const post = require('./post');

function createLogger(params) {
  const logger = params.__ow_logger || console;
  return {
    info: (...args) => (logger.info ? logger.info(...args) : console.info(...args)),
    warn: (...args) => (logger.warn ? logger.warn(...args) : console.warn(...args)),
    error: (...args) => (logger.error ? logger.error(...args) : console.error(...args)),
  };
}

async function main(params) {
  const logger = createLogger(params || {});
  const eventName = params && params.name ? params.name : 'order-placed';

  try {
    const validated = validator.validate(params);
    const transformed = transformer.transform(validated);
    sender.send(transformed, logger);
    return post.success(transformed);
  } catch (error) {
    logger.error('order-placed handler failed', {
      operation: 'log-order-placed',
      eventName,
      message: error.message,
      stack: error.stack,
    });

    return post.failure(error);
  }
}

module.exports = { main };
