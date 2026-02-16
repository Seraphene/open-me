import { afterEach, describe, expect, it, vi } from "vitest";
import handler from "../../functions/emergency-notify";

type CapturedResponse = {
  statusCode: number;
  payload: unknown;
};

function createResponseCapture() {
  const captured: CapturedResponse = {
    statusCode: 200,
    payload: null
  };

  const res = {
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
}

afterEach(() => {
  clearNotificationEnv();
  vi.unstubAllGlobals();
});

describe("emergency-notify", () => {
  it("returns 503 when no provider is configured", async () => {
    clearNotificationEnv();

    const { captured, res } = createResponseCapture();
    await handler(
      {
        method: "POST",
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
});
