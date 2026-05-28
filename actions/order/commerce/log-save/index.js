const { telemetryConfig } = require("../../../telemetry");
const {
  instrumentEntrypoint,
  getInstrumentationHelpers,
} = require("@adobe/aio-lib-telemetry");

const { stringParameters } = require("../../../utils");
const { validateData } = require("./validator");
const { preProcess } = require("./pre");
const { transformData } = require("./transformer");
const { sendData } = require("./sender");
const { postProcess } = require("./post");
const { HTTP_BAD_REQUEST, HTTP_INTERNAL_ERROR } = require("../../../constants");
const {
  actionErrorResponse,
  actionSuccessResponse,
  isActionSuccessful,
} = require("../../../responses");

async function main(params) {
  const { logger } = getInstrumentationHelpers();

  logger.info("Start processing order save log event");
  logger.debug(`Received params: ${stringParameters(params)}`);

  try {
    logger.debug(`Validate data: ${JSON.stringify(params.data)}`);
    const validation = validateData(params.data);
    if (!validation.success) {
      logger.error(`Validation failed with error: ${validation.message}`);
      return actionErrorResponse(HTTP_BAD_REQUEST, validation.message);
    }

    logger.debug(`Preprocess data: ${JSON.stringify(params.data)}`);
    const preProcessed = await preProcess(params);
    if (!preProcessed.success) {
      logger.info(preProcessed.message);
      return actionSuccessResponse(preProcessed.message);
    }

    logger.debug(`Transform data: ${JSON.stringify(params.data)}`);
    const transformedData = transformData(params.data);

    logger.debug(`Start sending data: ${JSON.stringify(transformedData)}`);
    const result = await sendData(params, transformedData, preProcessed);
    if (!result.success) {
      logger.error(`Send data failed: ${result.message}`);
      return actionErrorResponse(result.statusCode, result.message);
    }

    logger.debug(`Postprocess data: ${JSON.stringify(transformedData)}`);
    await postProcess(params, transformedData, preProcessed, result);

    logger.debug("Process finished successfully");
    return actionSuccessResponse(`Order save logged for order ${transformedData.orderId}`);
  } catch (error) {
    logger.error(`Error processing the request: ${error.message}`);
    return actionErrorResponse(HTTP_INTERNAL_ERROR, error.message);
  }
}

exports.main = instrumentEntrypoint(main, {
  ...telemetryConfig,
  isSuccessful: isActionSuccessful,
});
