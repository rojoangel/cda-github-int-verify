const { getInstrumentationHelpers } = require("@adobe/aio-lib-telemetry");

async function sendData(params, transformedData) {
  const { logger } = getInstrumentationHelpers();

  try {
    logger.info(
      JSON.stringify({
        message: "Order save event received",
        eventName: transformedData.eventName,
        orderId: transformedData.orderId,
      })
    );

    return {
      success: true,
      statusCode: 200,
      message: "Logged order save event",
    };
  } catch (error) {
    logger.error(`Logging failed for order ${transformedData.orderId}: ${error.message}`);
    return {
      success: false,
      statusCode: 500,
      message: error.message,
    };
  }
}

module.exports = {
  sendData,
};
