import { defineConfig } from '@adobe/aio-commerce-lib-app/config';

export default defineConfig({
  metadata: {
    id: 'product-reviews-proxy',
    displayName: 'Product Reviews Proxy',
    description: 'Public App Builder proxy for product reviews and ratings endpoints backed by an external reviews API.',
    version: '1.0.0',
  },
  businessConfig: {
    schema: [
      {
        name: 'reviews-api-base-url',
        label: 'Reviews API Base URL',
        type: 'url',
        default: '',
      },
      {
        name: 'reviews-api-bearer-token',
        label: 'Reviews API Bearer Token',
        type: 'password',
        default: '',
      },
    ],
  },
});
