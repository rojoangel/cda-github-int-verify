function transform(input) {
  return {
    eventName: input.eventName,
    orderId: input.orderId,
    loggedAt: new Date().toISOString(),
  };
}

module.exports = { transform };
