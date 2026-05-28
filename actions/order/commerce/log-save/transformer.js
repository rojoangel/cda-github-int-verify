function transformData(data) {
  const orderId = data.order_id || data.orderId || data.entity_id || data.id;

  return {
    orderId: String(orderId),
    eventName: "observer.sales_order_save_commit_after",
  };
}

module.exports = {
  transformData,
};
