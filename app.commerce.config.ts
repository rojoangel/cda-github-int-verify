import { defineConfig } from "@adobe/aio-commerce-lib-app/config";

export default defineConfig({
  metadata: {
    id: "reviews-ratings-proxy",
    displayName: "Reviews Ratings Proxy",
    description: "Proxy storefront reviews and ratings requests to the external reviews API.",
    version: "1.0.0",
  },
  businessConfig: {
    schema: [
      {
        name: "REVIEWS_API_BASE_URL",
        type: "url",
        label: "Reviews API Base URL",
        description: "Base URL for the external reviews and ratings API.",
        default: "",
      },
      {
        name: "REVIEWS_API_BEARER_TOKEN",
        type: "password",
        label: "Reviews API Bearer Token",
        description: "Bearer token used to authenticate requests to the external reviews and ratings API.",
        default: "",
      },
    ],
  },
});
