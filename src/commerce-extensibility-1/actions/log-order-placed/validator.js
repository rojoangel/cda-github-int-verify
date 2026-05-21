function validate(params) {
  const data = params && params.data;
  if (!data || typeof data !== 'object') {
    const error = new Error('Invalid event payload: data is required');
    error.statusCode = 400;
    throw error;
  }

  const orderId = data.order_id || data.orderId;
  if (!orderId || (typeof orderId !== 'string' && typeof orderId !== 'number')) {
    const error = new Error('Invalid event payload: order_id is required');
    error.statusCode = 400;
    throw error;
  }

  return { data, orderId: String(orderId), eventName: params.name || 'order-placed' };
}

module.exports = { validate };
