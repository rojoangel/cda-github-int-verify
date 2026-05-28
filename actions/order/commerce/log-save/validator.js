const {
  instrument,
  getInstrumentationHelpers,
} = require("@adobe/aio-lib-telemetry");
const { isOperationSuccessful } = require("../../../telemetry");

function validateData(data) {
  const { currentSpan } = getInstrumentationHelpers();
  currentSpan.addEvent("log-save.phase", { value: "validateData" });

  if (!data || typeof data !== "object") {
    return {
      success: false,
      message: "Invalid data: expected event payload object",
    };
  }

  const orderId = data.order_id || data.orderId || data.entity_id || data.id;
  if (orderId === undefined || orderId === null || orderId === "") {
    return {
      success: false,
      message: "Invalid data: missing order id",
    };
  }

  return {
    success: true,
  };
}

module.exports = {
  validateData: instrument(validateData, {
    isSuccessful: isOperationSuccessful,
  }),
};
