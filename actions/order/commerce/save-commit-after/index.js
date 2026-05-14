'use strict';

const { validate } = require('./validator');
const { transform } = require('./transformer');
const { persistAuditLog } = require('./logger');

async function main(params) {
  try {
    const validation = validate(params);
    if (!validation.valid) {
      return {
        statusCode: validation.statusCode,
        body: { ok: false, message: validation.message },
      };
    }

    const record = transform(params);
    await persistAuditLog(record, params);

    return {
      statusCode: 200,
      body: { ok: true, orderId: record.orderId },
    };
  } catch (error) {
    console.error(JSON.stringify({
      operation: 'order.save-commit-after',
      message: 'Unhandled error processing order event.',
      error: error.message,
    }));

    return {
      statusCode: 500,
      body: { ok: false, message: 'Failed to process order event.' },
    };
  }
}

exports.main = main;
