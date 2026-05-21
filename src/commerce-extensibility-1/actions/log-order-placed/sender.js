function send(payload, logger) {
  logger.info('order placed event received', {
    operation: 'log-order-placed',
    eventName: payload.eventName,
    orderId: payload.orderId,
    loggedAt: payload.loggedAt,
  });
}

module.exports = { send };
