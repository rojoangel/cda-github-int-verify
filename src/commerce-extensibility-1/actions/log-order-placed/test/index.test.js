const assert = require('assert');
const { main } = require('../index');
const validator = require('../validator');
const transformer = require('../transformer');

async function run() {
  const response = await main({
    name: 'plugin.order_placed',
    data: { order_id: 12345 },
    __ow_logger: { info() {}, warn() {}, error() {} },
  });

  assert.strictEqual(response.statusCode, 200);
  assert.deepStrictEqual(response.body, {
    ok: true,
    eventName: 'plugin.order_placed',
    orderId: '12345',
  });

  assert.throws(() => validator.validate({ name: 'plugin.order_placed', data: {} }), /order_id is required/);
  assert.throws(() => validator.validate({}), /data is required/);

  const transformed = transformer.transform({ eventName: 'plugin.order_placed', orderId: '12345' });
  assert.strictEqual(transformed.eventName, 'plugin.order_placed');
  assert.strictEqual(transformed.orderId, '12345');
  assert.ok(transformed.loggedAt);

  const invalid = await main({
    name: 'plugin.order_placed',
    data: {},
    __ow_logger: { info() {}, warn() {}, error() {} },
  });

  assert.strictEqual(invalid.statusCode, 400);
  assert.match(invalid.body.error, /order_id is required/);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
