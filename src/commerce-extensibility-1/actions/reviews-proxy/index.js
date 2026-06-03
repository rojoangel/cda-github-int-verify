import { createHash } from "node:crypto";
import {
  initialize,
  getConfigurationByKey,
  byCodeAndLevel,
} from "@adobe/aio-commerce-lib-config";

import schema from "../../../commerce-configuration-1/.generated/configuration-schema.json" with { type: "json" };

const ALLOWED_PATHS = new Set([
  "/api/products",
  "/api/products/reviews",
  "/api/products/ratings",
  "/api/reviews",
  "/api/ratings",
]);

const MAX_RETRIES = 2;
const RETRYABLE_STATUS = new Set([502, 503, 504]);
let configInitialized = false;

function response(statusCode, body, contentType) {
  return {
    statusCode,
    headers: {
      "Content-Type": contentType || "application/json; charset=utf-8",
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  };
}

function normalizePath(path) {
  const [pathname] = String(path || "").split("?");
  return pathname.replace(/\/+$/, "") || "/";
}

function isAllowedPath(path) {
  return [...ALLOWED_PATHS].some((allowedPath) => path === allowedPath || path.startsWith(`${allowedPath}/`));
}

async function ensureConfigInitialized() {
  if (!configInitialized) {
    await initialize({ schema });
    configInitialized = true;
  }
}

async function readBusinessConfig() {
  await ensureConfigInitialized();
  const base = await getConfigurationByKey("REVIEWS_API_BASE_URL", byCodeAndLevel("global", "global"));
  const token = await getConfigurationByKey("REVIEWS_API_BEARER_TOKEN", byCodeAndLevel("global", "global"));
  const baseUrl = base?.config?.value || "";
  const bearerToken = token?.config?.value || "";

  if (!baseUrl || !/^https?:\/\//i.test(baseUrl)) {
    throw new Error("Missing or invalid REVIEWS_API_BASE_URL");
  }

  if (!bearerToken) {
    throw new Error("Missing REVIEWS_API_BEARER_TOKEN");
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ""), bearerToken };
}

function makeIdempotencyKey(method, path, body) {
  return createHash("sha256").update(`${method}:${path}:${body || ""}`).digest("hex");
}

async function fetchWithRetry(url, init, logger) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetch(url, init);
      if (RETRYABLE_STATUS.has(response.status) && attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 100 * (2 ** attempt)));
        continue;
      }
      return response;
    } catch (error) {
      logger.error({ operation: "fetch-upstream", attempt, message: error.message });
      if (attempt >= MAX_RETRIES) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 100 * (2 ** attempt)));
    }
  }

  throw new Error("Upstream fetch failed");
}

export async function main(params = {}) {
  const logger = console;
  const method = (params.__ow_method || params.method || "GET").toUpperCase();
  const path = normalizePath(params.__ow_path || params.path);
  const queryString = params.__ow_query || params.queryString || "";
  const body = params.__ow_body || params.body || "";

  if (!isAllowedPath(path)) {
    return response(400, { error: "Unsupported path" });
  }

  if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return response(400, { error: "Unsupported method" });
  }

  let config;
  try {
    config = await readBusinessConfig();
  } catch (error) {
    logger.error({ operation: "resolve-config", path, message: error.message });
    return response(500, { error: "Reviews API configuration is not available" });
  }

  const upstreamUrl = `${config.baseUrl}${path}${queryString ? `?${queryString}` : ""}`;
  const idempotencyKey = makeIdempotencyKey(method, path, body);

  try {
    const upstreamResponse = await fetchWithRetry(upstreamUrl, {
      method,
      headers: {
        Authorization: `Bearer ${config.bearerToken}`,
        "Content-Type": params.__ow_headers?.["content-type"] || params.__ow_headers?.["Content-Type"] || "application/json",
        "X-Idempotency-Key": idempotencyKey,
      },
      body: ["GET", "DELETE"].includes(method) ? undefined : body,
    }, logger);

    const upstreamBody = await upstreamResponse.text();
    return response(upstreamResponse.status, upstreamBody, upstreamResponse.headers.get("content-type") || "application/json; charset=utf-8");
  } catch (error) {
    logger.error({ operation: "proxy-request", path, method, message: error.message });
    return response(502, { error: "Failed to reach reviews API" });
  }
}
