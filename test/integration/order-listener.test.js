'use strict';

jest.mock('@adobe/aio-lib-state', () => ({ init: jest.fn() }));

const stateLib = require('@adobe/aio-lib-state');
const { main } = require('../../actions/order/commerce/save-commit-after/index');

describe('order listener action', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('persists valid order event', async () => {
    const put = jest.fn().mockResolvedValue(undefined);
    stateLib.init.mockResolvedValue({ put });

    const response = await main({
      type: 'com.adobe.commerce.observer.sales_order_save_commit_after',
      time: new Date().toISOString(),
      headers: { 'ce-signature': 'sig' },
      id: 'evt-1',
      data: { order_id: 50 },
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ ok: true, orderId: '50' });
    expect(put).toHaveBeenCalled();
  });

  test('returns error for invalid signature', async () => {
    const response = await main({
      type: 'com.adobe.commerce.observer.sales_order_save_commit_after',
      time: new Date().toISOString(),
      headers: {},
      data: { order_id: 50 },
    });

    expect(response.statusCode).toBe(401);
  });

  test('returns error for missing order id', async () => {
    const response = await main({
      type: 'com.adobe.commerce.observer.sales_order_save_commit_after',
      time: new Date().toISOString(),
      headers: { 'ce-signature': 'sig' },
      data: {},
    });

    expect(response.statusCode).toBe(500);
  });

  test('returns error when state write fails after retries', async () => {
    const put = jest.fn().mockRejectedValue(new Error('state failed'));
    stateLib.init.mockResolvedValue({ put });

    const response = await main({
      type: 'com.adobe.commerce.observer.sales_order_save_commit_after',
      time: new Date().toISOString(),
      headers: { 'ce-signature': 'sig' },
      id: 'evt-2',
      data: { order_id: 51 },
    });

    expect(response.statusCode).toBe(500);
    expect(put).toHaveBeenCalled();
  });
});
