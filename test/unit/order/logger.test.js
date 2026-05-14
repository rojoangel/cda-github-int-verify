'use strict';

jest.mock('@adobe/aio-lib-state', () => ({
  init: jest.fn(),
}));

const stateLib = require('@adobe/aio-lib-state');
const { persistAuditLog } = require('../../../actions/order/commerce/save-commit-after/logger');

describe('order logger', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('writes audit log to state', async () => {
    const put = jest.fn().mockResolvedValue(undefined);
    stateLib.init.mockResolvedValue({ put });

    await expect(persistAuditLog({ orderId: '10', timestamp: 'now', source: 'src', eventId: 'evt' })).resolves.toEqual({ key: 'orders:log:10' });
    expect(put).toHaveBeenCalledWith('orders:log:10', expect.any(String), expect.objectContaining({ ttl: expect.any(Number) }));
  });

  test('retries on state failure', async () => {
    const put = jest.fn()
      .mockRejectedValueOnce(new Error('temporary'))
      .mockResolvedValueOnce(undefined);
    stateLib.init.mockResolvedValue({ put });

    await expect(persistAuditLog({ orderId: '11', timestamp: 'now', source: 'src', eventId: 'evt' })).resolves.toEqual({ key: 'orders:log:11' });
    expect(put).toHaveBeenCalledTimes(2);
  });
});
