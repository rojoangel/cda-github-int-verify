'use strict';

const stateLib = require('@adobe/aio-lib-state');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry(operation, attempts = 3) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.error(JSON.stringify({
        operation: 'order.audit.persist.retry',
        attempt: attempt + 1,
        error: error.message,
      }));
      if (attempt === attempts - 1) break;
      await sleep(50 * (2 ** attempt));
    }
  }
  throw lastError;
}

async function persistAuditLog(record) {
  console.log(JSON.stringify({ operation: 'order.audit.persist', record }));
  const state = await stateLib.init();
  const key = `orders:log:${record.orderId}`;
  const value = JSON.stringify(record);
  await withRetry(() => state.put(key, value, { ttl: 60 * 60 * 24 * 30 }));
  return { key };
}

module.exports = {
  persistAuditLog,
  withRetry,
};
