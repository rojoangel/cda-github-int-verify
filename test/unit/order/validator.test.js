'use strict';

const { validate, validateTimestamp, validateEventType } = require('../../../actions/order/commerce/save-commit-after/validator');

describe('order validator', () => {
  test('accepts a valid event', () => {
    const event = {
      type: 'com.adobe.commerce.observer.sales_order_save_commit_after',
      time: new Date().toISOString(),
      headers: { 'ce-signature': 'abc123' },
    };

    expect(validate(event)).toEqual({ valid: true });
  });

  test('rejects expired timestamps', () => {
    const expired = new Date(Date.now() - 6 * 60 * 1000).toISOString();
    expect(validateTimestamp(expired)).toBe(false);
  });

  test('rejects malformed events and unsupported types', () => {
    expect(validate(null)).toEqual({ valid: false, statusCode: 400, message: 'Invalid event payload.' });
    expect(validateEventType('bad.type')).toBe(false);
  });
});
