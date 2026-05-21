import { defineConfig } from "@adobe/aio-commerce-lib-app/config";

export default defineConfig({
  metadata: {
    id: "proj-c5ef476e-81ff-4c4e-99a9-9299a0d34d59",
    displayName: "proj-c5ef476e-81ff-4c4e-99a9-9299a0d34d59",
    description: "Commerce App Builder application",
    version: "1.0.0",
  },
  eventing: {
    commerce: [
      {
        provider: {
          label: "Commerce Events Provider",
          description: "Handles native Commerce order events for this app.",
        },
        events: [
          {
            name: "plugin.sales.api.order_management.place",
            label: "Order Placed",
            description: "Triggered when a customer places an order.",
            fields: [{ name: "order_id" }],
            runtimeActions: ["commerce-events/log-order-placed"],
          },
        ],
      },
    ],
  },
});
