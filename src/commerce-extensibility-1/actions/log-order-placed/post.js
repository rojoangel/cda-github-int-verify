function success(payload) {
  return {
    statusCode: 200,
    body: {
      ok: true,
      eventName: payload.eventName,
      orderId: payload.orderId,
    },
  };
}

function failure(error) {
  return {
    statusCode: error && error.statusCode ? error.statusCode : 500,
    body: {
      error: error.message,
    },
  };
}

module.exports = { success, failure };
