const { getState } = require("@adobe/aio-lib-state");

async function postProcess(params, transformedData, preProcessed, result) {
  const state = await getState(params);
  const marker = {
    orderId: transformedData.orderId,
    eventName: transformedData.eventName,
    statusCode: result.statusCode,
    processedAt: new Date().toISOString(),
  };

  await state.put(preProcessed.key, JSON.stringify(marker));

  return {
    success: true,
    key: preProcessed.key,
  };
}

module.exports = {
  postProcess,
};
