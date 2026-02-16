type RateLimitState = {
  count: number;
  resetAt: number;
};

type JsonRequest = {
  headers?: Record<string, string | undefined>;
  body?: unknown;
};

type JsonRequestValidationResult = {
  status: number;
  error: string;
};

type CorsRequest = {
  method?: string;
  headers?: Record<string, string | undefined>;
};

type CorsResponse = {
  setHeader?: (name: string, value: string) => void;
  status: (code: number) => { json: (payload: unknown) => void };
};

const rateLimitStore = new Map<string, RateLimitState>();

const CORS_ALLOWED_METHODS = "POST,OPTIONS";
const CORS_ALLOWED_HEADERS = "content-type,x-client-key,x-admin-token";

function normalizeOrigin(origin: string) {
  return origin.trim().replace(/\/+$/, "").toLowerCase();
}

function getAllowedOrigins() {
  const rawValue =
    process.env.OPEN_ME_ALLOWED_ORIGINS ??
    process.env.ALLOWED_ORIGINS ??
    "";

  return rawValue
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => normalizeOrigin(origin));
}

export function applyWriteEndpointSecurityHeaders(res: CorsResponse) {
  res.setHeader?.("Cache-Control", "no-store");
  res.setHeader?.("Pragma", "no-cache");
  res.setHeader?.("X-Content-Type-Options", "nosniff");
  res.setHeader?.("X-Frame-Options", "DENY");
  res.setHeader?.("Referrer-Policy", "no-referrer");
}

function getPayloadBytes(body: unknown) {
  if (body === undefined || body === null) {
    return 0;
  }

  return Buffer.byteLength(JSON.stringify(body), "utf8");
}

export function validateJsonWriteRequest(
  request: JsonRequest,
  options: { maxPayloadBytes: number }
): JsonRequestValidationResult | null {
  const contentType = request.headers?.["content-type"]?.toLowerCase() ?? "";
  if (!contentType.includes("application/json")) {
    return {
      status: 415,
      error: "Content-Type must be application/json"
    };
  }

  const payloadBytes = getPayloadBytes(request.body);
  if (payloadBytes > options.maxPayloadBytes) {
    return {
      status: 413,
      error: "Payload too large"
    };
  }

  return null;
}

export function validateCorsOrigin(
  req: CorsRequest,
  res: CorsResponse
): JsonRequestValidationResult | null {
  const origin = req.headers?.origin?.trim();
  const allowedOrigins = getAllowedOrigins();

  res.setHeader?.("Vary", "Origin");
  res.setHeader?.("Access-Control-Allow-Methods", CORS_ALLOWED_METHODS);
  res.setHeader?.("Access-Control-Allow-Headers", CORS_ALLOWED_HEADERS);

  if (!origin) {
    return null;
  }

  const normalizedOrigin = normalizeOrigin(origin);
  if (!allowedOrigins.includes(normalizedOrigin)) {
    return {
      status: 403,
      error: "Origin not allowed"
    };
  }

  res.setHeader?.("Access-Control-Allow-Origin", origin);
  return null;
}

export function handleWriteEndpointPreflight(
  req: CorsRequest,
  res: CorsResponse
) {
  if (req.method !== "OPTIONS") {
    return false;
  }

  const validation = validateCorsOrigin(req, res);
  if (validation) {
    res.status(validation.status).json({ error: validation.error });
    return true;
  }

  res.status(204).json({ ok: true });
  return true;
}

export function getRequestClientKey(headers?: Record<string, string | undefined>) {
  const explicitClientKey = headers?.["x-client-key"];
  if (explicitClientKey?.trim()) {
    return explicitClientKey.trim();
  }

  const forwardedFor = headers?.["x-forwarded-for"];
  if (forwardedFor?.trim()) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return "unknown";
}

export function hitRateLimit(options: {
  scope: string;
  clientKey: string;
  maxRequests: number;
  windowMs: number;
}) {
  const now = Date.now();
  const key = `${options.scope}:${options.clientKey}`;
  const existing = rateLimitStore.get(key);

  if (!existing || now > existing.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + options.windowMs
    });
    return false;
  }

  if (existing.count >= options.maxRequests) {
    return true;
  }

  existing.count += 1;
  rateLimitStore.set(key, existing);
  return false;
}

export function __resetRateLimitState() {
  rateLimitStore.clear();
}
