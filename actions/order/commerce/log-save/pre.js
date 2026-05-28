const { getState } = require("@adobe/aio-lib-state");

async function preProcess(params) {
  const state = await getState(params);
  const orderId = params?.data?.order_id || params?.data?.orderId || params?.data?.entity_id || params?.data?.id;
  const key = `order-save:${orderId}`;
  const existing = await state.get(key);

  if (existing && existing.value) {
    return {
      success: false,
      message: `Order save already processed for order ${orderId}`,
      key,
      orderId,
      skipped: true,
    };
  }

  return {
    success: true,
    key,
    orderId,
  };
}

module.exports = {
  preProcess,
};
