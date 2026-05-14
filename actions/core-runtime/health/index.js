'use strict';

async function main(params) {
  return {
    statusCode: 200,
    body: {
      ok: true,
      message: 'Core runtime scaffold is ready.',
      receivedKeys: Object.keys(params ?? {}).sort(),
    },
  };
}

exports.main = main;
