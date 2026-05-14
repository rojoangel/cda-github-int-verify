'use strict';

const ALLOWED_EVENT_TYPES = new Set([
  'com.adobe.commerce.observer.sales_order_save_commit_after',
]);

function getHeader(headers, name) {
  if (!headers) return undefined;
  const lower = name.toLowerCase();
  const key = Object.keys(headers).find((header) => header.toLowerCase() === lower);
  return key ? headers[key] : undefined;
}

function validateSignature(headers) {
  const signature = getHeader(headers, 'ce-signature');
  return typeof signature === 'string' && signature.length > 0;
}

function validateTimestamp(timestamp) {
  if (!timestamp) return false;
  const eventTime = new Date(timestamp).getTime();
  if (Number.isNaN(eventTime)) return false;
  return Date.now() - eventTime <= 5 * 60 * 1000;
}

function validateEventType(eventType) {
  return ALLOWED_EVENT_TYPES.has(eventType);
}

function validate(event) {
  if (!event || typeof event !== 'object') {
    return { valid: false, statusCode: 400, message: 'Invalid event payload.' };
  }

  if (!validateSignature(event.headers)) {
    return { valid: false, statusCode: 401, message: 'Missing or invalid CloudEvents signature.' };
  }

  if (!validateTimestamp(event.time)) {
    return { valid: false, statusCode: 400, message: 'Event timestamp is invalid or expired.' };
  }

  if (!validateEventType(event.type)) {
    return { valid: false, statusCode: 400, message: 'Unsupported event type.' };
  }

  return { valid: true };
}

module.exports = {
  ALLOWED_EVENT_TYPES,
  validate,
  validateSignature,
  validateTimestamp,
  validateEventType,
};
