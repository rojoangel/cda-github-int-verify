import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

const originalFetch = global.fetch;

async function loadModule() {
  return import('./index.js?test=' + Date.now());
}

describe('reviews-proxy action', () => {
  beforeEach(() => {
    process.env.REVIEWS_API_BASE_URL = 'https://reviews.example.com';
    process.env.REVIEWS_API_BEARER_TOKEN = 'secret-token';
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.REVIEWS_API_BASE_URL;
    delete process.env.REVIEWS_API_BEARER_TOKEN;
  });

  it('rejects excluded routes with 404', async () => {
    const { main } = await loadModule();
    const response = await main({ __ow_method: 'GET', __ow_path: '/api/product-ugc/foo' });
    assert.equal(response.statusCode, 404);
  });

  it('rejects invalid methods with 405', async () => {
    const { main } = await loadModule();
    const response = await main({ __ow_method: 'PUT', __ow_path: '/api/reviews/sku123' });
    assert.equal(response.statusCode, 405);
  });

  it('forwards GET requests and preserves response content type', async () => {
    global.fetch = async (url, init) => ({
      status: 200,
      headers: { get: (name) => (name.toLowerCase() === 'content-type' ? 'application/json; charset=utf-8' : null) },
      text: async () => JSON.stringify({ ok: true, url, init }),
    });
    const { main } = await loadModule();
    const response = await main({ __ow_method: 'GET', __ow_path: '/api/reviews/sku123' });
    assert.equal(response.statusCode, 200);
    assert.equal(response.headers['Content-Type'], 'application/json; charset=utf-8');
    assert.match(response.body, /"ok":true/);
  });

  it('sends bearer auth and JSON body for POST', async () => {
    let captured;
    global.fetch = async (url, init) => {
      captured = { url, init };
      return {
        status: 201,
        headers: { get: () => 'application/json' },
        text: async () => '{}',
      };
    };
    const { main } = await loadModule();
    await main({ __ow_method: 'POST', __ow_path: '/api/ratings/sku123', __ow_body: { value: 5 } });
    assert.equal(captured.init.headers.Authorization, 'Bearer secret-token');
    assert.equal(captured.init.headers['Content-Type'], 'application/json');
    assert.equal(captured.url, 'https://reviews.example.com/ratings/sku123');
  });
});
