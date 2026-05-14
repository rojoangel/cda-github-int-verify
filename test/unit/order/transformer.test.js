'use strict';

const { extractOrderId, transform } = require('../../../actions/order/commerce/save-commit-after/transformer');

describe('order transformer', () => {
  test('extracts order id from payload', () => {
    expect(extractOrderId({ data: { order_id: 123 } })).toBe('123');
  });

  test('throws when order id is missing', () => {
    expect(() => extractOrderId({ data: {} })).toThrow('Missing order ID in Commerce order payload.');
  });

  test('builds structured record', () => {
    const record = transform({
      id: 'event-1',
      time: '2026-05-14T00:00:00.000Z',
      source: 'com.adobe.commerce',
      data: { entity_id: 88 },
    });

    expect(record).toEqual({
      orderId: '88',
      timestamp: '2026-05-14T00:00:00.000Z',
      source: 'com.adobe.commerce',
      eventId: 'event-1',
    });
  });
});
