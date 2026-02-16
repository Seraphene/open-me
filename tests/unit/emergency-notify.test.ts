import { afterEach, describe, expect, it, vi } from "vitest";
import handler from "../../functions/emergency-notify";
import { __resetRateLimitState } from "../../functions/security";

type CapturedResponse = {
  statusCode: number;
  payload: unknown;
  headers: Record<string, string>;
};

function createResponseCapture() {
  const captured: CapturedResponse = {
    statusCode: 200,
    payload: null,
    headers: {}
  };

  const res = {
    setHeader(name: string, value: string) {
      captured.headers[name] = value;
    },
    status(code: number) {
      captured.statusCode = code;
      return {
        json(payload: unknown) {
          captured.payload = payload;
        }
      };
    }
  };

  return { captured, res };
}

function clearNotificationEnv() {
  delete process.env.GMAIL_OAUTH_ACCESS_TOKEN;
  delete process.env.GMAIL_SENDER_EMAIL;
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_PORT;
  delete process.env.SMTP_USERNAME;
  delete process.env.SMTP_PASSWORD;
  delete process.env.SMTP_FROM_EMAIL;
  delete process.env.EMERGENCY_RECIPIENT_EMAIL;
  delete process.env.OPEN_ME_ALLOWED_ORIGINS;
  delete process.env.ALLOWED_ORIGINS;
}

afterEach(() => {
  clearNotificationEnv();
  __resetRateLimitState();
  vi.unstubAllGlobals();
});

describe("emergency-notify", () => {
  it("returns 503 when no provider is configured", async () => {
    clearNotificationEnv();

    const { captured, res } = createResponseCapture();
    await handler(
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: {
          message: "Please check in",
          recipientEmail: "receiver@example.com"
        }
      },
      res
    );

    expect(captured.statusCode).toBe(503);
    expect(captured.payload).toMatchObject({
      accepted: false,
      delivered: false,
      provider: "none"
    });
  });

  it("returns 200 when Gmail API delivery succeeds", async () => {
    process.env.GMAIL_OAUTH_ACCESS_TOKEN = "token";
    process.env.GMAIL_SENDER_EMAIL = "sender@example.com";

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        text: async () => "ok"
      }))
    );

    const { captured, res } = createResponseCapture();
    await handler(
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: {
          message: "Please check in",
          recipientEmail: "receiver@example.com"
        }
      },
      res
    );

    expect(captured.statusCode).toBe(200);
    expect(captured.payload).toMatchObject({
      accepted: true,
      delivered: true,
      provider: "gmail-api"
    });
  });

  it("returns 503 when SMTP fallback is configured but transport dependency is missing", async () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USERNAME = "user";
    process.env.SMTP_PASSWORD = "pass";
    process.env.SMTP_FROM_EMAIL = "sender@example.com";

    const { captured, res } = createResponseCapture();
    await handler(
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: {
          message: "Please check in",
          recipientEmail: "receiver@example.com"
        }
      },
      res
    );

    expect(captured.statusCode).toBe(503);
    expect(captured.payload).toMatchObject({
      accepted: false,
      delivered: false,
      provider: "smtp-fallback"
    });
  });

  it("returns 429 when rate limit is exceeded", async () => {
    clearNotificationEnv();

    const first = createResponseCapture();
    await handler(
      {
        method: "POST",
        headers: { "x-client-key": "test-client", "content-type": "application/json" },
        body: {
          message: "Please check in",
          recipientEmail: "receiver@example.com"
        }
      },
      first.res
    );

    const second = createResponseCapture();
    await handler(
      {
        method: "POST",
        headers: { "x-client-key": "test-client", "content-type": "application/json" },
        body: {
          message: "Please check in",
          recipientEmail: "receiver@example.com"
        }
      },
      second.res
    );

    const third = createResponseCapture();
    await handler(
      {
        method: "POST",
        headers: { "x-client-key": "test-client", "content-type": "application/json" },
        body: {
          message: "Please check in",
          recipientEmail: "receiver@example.com"
        }
      },
      third.res
    );

    const fourth = createResponseCapture();
    await handler(
      {
        method: "POST",
        headers: { "x-client-key": "test-client", "content-type": "application/json" },
        body: {
          message: "Please check in",
          recipientEmail: "receiver@example.com"
        }
      },
      fourth.res
    );

    expect(first.captured.statusCode).not.toBe(429);
    expect(second.captured.statusCode).not.toBe(429);
    expect(third.captured.statusCode).not.toBe(429);
    expect(fourth.captured.statusCode).toBe(429);
    expect(fourth.captured.payload).toEqual({ error: "Too many requests" });
  });

  it("returns 415 when content-type is not json", async () => {
    const { captured, res } = createResponseCapture();

    await handler(
      {
        method: "POST",
        headers: { "content-type": "text/plain" },
        body: {
          message: "Please check in",
          recipientEmail: "receiver@example.com"
        }
      },
      res
    );

    expect(captured.statusCode).toBe(415);
    expect(captured.payload).toEqual({ error: "Content-Type must be application/json" });
  });

  it("returns 400 for invalid recipient email", async () => {
    const { captured, res } = createResponseCapture();

    await handler(
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: {
          message: "Please check in",
          recipientEmail: "not-an-email"
        }
      },
      res
    );

    expect(captured.statusCode).toBe(400);
    expect(captured.payload).toEqual({ error: "recipientEmail must be a valid email" });
  });

  it("returns 400 for oversized message", async () => {
    const { captured, res } = createResponseCapture();

    await handler(
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: {
          message: "x".repeat(1001),
          recipientEmail: "receiver@example.com"
        }
      },
      res
    );

    expect(captured.statusCode).toBe(400);
    expect(captured.payload).toEqual({ error: "message must be 1000 characters or less" });
  });

  it("returns 400 for oversized context", async () => {
    const { captured, res } = createResponseCapture();

    await handler(
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: {
          message: "Please check in",
          recipientEmail: "receiver@example.com",
          context: "x".repeat(1001)
        }
      },
      res
    );

    expect(captured.statusCode).toBe(400);
    expect(captured.payload).toEqual({ error: "context must be 1000 characters or less" });
  });

  it("returns 403 when origin is not allowed", async () => {
    process.env.OPEN_ME_ALLOWED_ORIGINS = "https://app.openme.example";
    const { captured, res } = createResponseCapture();

    await handler(
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "https://evil.example"
        },
        body: {
          message: "Please check in",
          recipientEmail: "receiver@example.com"
        }
      },
      res
    );

    expect(captured.statusCode).toBe(403);
    expect(captured.payload).toEqual({ error: "Origin not allowed" });
  });

  it("returns 204 for allowed preflight request", async () => {
    process.env.OPEN_ME_ALLOWED_ORIGINS = "https://app.openme.example";
    const { captured, res } = createResponseCapture();

    await handler(
      {
        method: "OPTIONS",
        headers: {
          origin: "https://app.openme.example"
        }
      },
      res
    );

    expect(captured.statusCode).toBe(204);
    expect(captured.payload).toEqual({ ok: true });
  });

  it("applies security and cache-control headers", async () => {
    const { captured, res } = createResponseCapture();

    await handler(
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: {
          message: "Please check in",
          recipientEmail: "receiver@example.com"
        }
      },
      res
    );

    expect(captured.headers["Cache-Control"]).toBe("no-store");
    expect(captured.headers.Pragma).toBe("no-cache");
    expect(captured.headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(captured.headers["X-Frame-Options"]).toBe("DENY");
    expect(captured.headers["Referrer-Policy"]).toBe("no-referrer");
  });
});
