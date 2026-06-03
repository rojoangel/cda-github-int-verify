import assert from "node:assert/strict";
import test from "node:test";

const originalFetch = global.fetch;

async function loadHandler() {
  return import(`../index.js?test=${Date.now()}`);
}

test("returns 400 for unsupported path", async () => {
  const { main } = await loadHandler();
  const result = await main({ __ow_path: "/api/product-ugc", __ow_method: "GET" });
  assert.equal(result.statusCode, 400);
  assert.match(result.body, /Unsupported path/);
});

test("fails fast when config is missing", async () => {
  const prevBaseUrl = process.env.REVIEWS_API_BASE_URL;
  const prevToken = process.env.REVIEWS_API_BEARER_TOKEN;
  delete process.env.REVIEWS_API_BASE_URL;
  delete process.env.REVIEWS_API_BEARER_TOKEN;

  const { main } = await loadHandler();
  const result = await main({ __ow_path: "/api/reviews", __ow_method: "GET" });
  assert.equal(result.statusCode, 500);
  assert.match(result.body, /configuration is not available/);

  if (prevBaseUrl !== undefined) process.env.REVIEWS_API_BASE_URL = prevBaseUrl;
  if (prevToken !== undefined) process.env.REVIEWS_API_BEARER_TOKEN = prevToken;
});

test("proxies upstream success responses", async () => {
  global.fetch = async () => new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

  const { main } = await loadHandler();
  const result = await main({ __ow_path: "/api/reviews", __ow_method: "GET", __ow_query: "sku=1" });
  assert.equal(result.statusCode, 200);
  assert.equal(result.headers["Content-Type"], "application/json");
  assert.equal(result.body, '{"ok":true}');

  global.fetch = originalFetch;
});
