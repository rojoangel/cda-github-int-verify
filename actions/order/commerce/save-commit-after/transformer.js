'use strict';

function extractOrderId(event) {
  const data = event && event.data ? event.data : {};
  const candidate = data.order_id || data.entity_id || data.id || data.orderId;
  if (candidate === undefined || candidate === null || candidate === '') {
    throw new Error('Missing order ID in Commerce order payload.');
  }
  return String(candidate);
}

function transform(event) {
  const orderId = extractOrderId(event);
  return {
    orderId,
    timestamp: event.time || new Date().toISOString(),
    source: event.source || 'com.adobe.commerce',
    eventId: event.id || null,
  };
}

module.exports = {
  extractOrderId,
  transform,
};
