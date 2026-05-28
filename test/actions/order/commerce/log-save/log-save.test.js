const action = require("../../../../../actions/order/commerce/log-save");

jest.mock("../../../../../actions/order/commerce/log-save/validator", () => ({
  validateData: jest.fn(),
}));
jest.mock("../../../../../actions/order/commerce/log-save/pre", () => ({
  preProcess: jest.fn(),
}));
jest.mock("../../../../../actions/order/commerce/log-save/transformer", () => ({
  transformData: jest.fn(),
}));
jest.mock("../../../../../actions/order/commerce/log-save/sender", () => ({
  sendData: jest.fn(),
}));
jest.mock("../../../../../actions/order/commerce/log-save/post", () => ({
  postProcess: jest.fn(),
}));

const { validateData } = require("../../../../../actions/order/commerce/log-save/validator");
const { preProcess } = require("../../../../../actions/order/commerce/log-save/pre");
const { transformData } = require("../../../../../actions/order/commerce/log-save/transformer");
const { sendData } = require("../../../../../actions/order/commerce/log-save/sender");
const { postProcess } = require("../../../../../actions/order/commerce/log-save/post");

beforeAll(() => {
  process.env.__AIO_DEV = "false";
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("Given order commerce log-save action", () => {
  test("Then main is a function", () => {
    expect(action.main).toBeInstanceOf(Function);
  });

  test("Then returns bad request for invalid data", async () => {
    validateData.mockReturnValue({
      success: false,
      message: "Invalid data",
    });

    const response = await action.main({ data: {} });

    expect(response).toEqual({
      statusCode: 400,
      body: {
        success: false,
        error: "Invalid data",
      },
    });
    expect(preProcess).not.toHaveBeenCalled();
    expect(transformData).not.toHaveBeenCalled();
    expect(sendData).not.toHaveBeenCalled();
    expect(postProcess).not.toHaveBeenCalled();
  });

  test("Then logs order id and stores marker on success", async () => {
    validateData.mockReturnValue({ success: true });
    preProcess.mockResolvedValue({
      success: true,
      key: "order-save:1000001",
      orderId: "1000001",
    });
    transformData.mockReturnValue({
      orderId: "1000001",
      eventName: "observer.sales_order_save_commit_after",
    });
    sendData.mockResolvedValue({
      success: true,
      statusCode: 200,
      message: "Logged order save event",
    });
    postProcess.mockResolvedValue({ success: true });

    const response = await action.main({
      data: { order_id: 1000001 },
      LOG_LEVEL: "debug",
    });

    expect(response).toEqual({
      statusCode: 200,
      body: {
        success: true,
        message: "Order save logged for order 1000001",
      },
    });
    expect(preProcess).toHaveBeenCalledWith({
      data: { order_id: 1000001 },
      LOG_LEVEL: "debug",
    });
    expect(transformData).toHaveBeenCalledWith({ order_id: 1000001 });
    expect(sendData).toHaveBeenCalledWith(
      { data: { order_id: 1000001 }, LOG_LEVEL: "debug" },
      { orderId: "1000001", eventName: "observer.sales_order_save_commit_after" },
      { success: true, key: "order-save:1000001", orderId: "1000001" }
    );
    expect(postProcess).toHaveBeenCalled();
  });
});
