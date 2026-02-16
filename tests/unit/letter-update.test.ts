import { afterEach, describe, expect, it } from "vitest";
import handler from "../../functions/letter-update";
import { __resetLetterStore } from "../../functions/letters-store";
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

const validPayload = {
  id: "sad-day",
  title: "Open when you feel sad",
  preview: "A reminder that you are deeply loved.",
  content: "You are stronger than this moment.",
  lockType: "honor" as const,
  media: [{ kind: "image" as const, src: "https://example.com/a.jpg" }]
};

afterEach(() => {
  delete process.env.CMS_ADMIN_TOKEN;
  delete process.env.OPEN_ME_ALLOWED_ORIGINS;
  delete process.env.ALLOWED_ORIGINS;
  __resetLetterStore();
  __resetRateLimitState();
});

describe("letter-update", () => {
  it("rejects non-POST methods", async () => {
    process.env.CMS_ADMIN_TOKEN = "secret";
    const { captured, res } = createResponseCapture();

    await handler({ method: "GET" }, res);

    expect(captured.statusCode).toBe(405);
    expect(captured.headers["Cache-Control"]).toBe("no-store");
    expect(captured.headers["X-Frame-Options"]).toBe("DENY");
  });

  it("rejects when admin token is missing", async () => {
    const { captured, res } = createResponseCapture();

    await handler(
      {
        method: "POST",
        body: validPayload,
        headers: { "x-admin-token": "secret", "content-type": "application/json" }
      },
      res
    );

    expect(captured.statusCode).toBe(503);
  });

  it("rejects unauthorized requests", async () => {
    process.env.CMS_ADMIN_TOKEN = "secret";
    const { captured, res } = createResponseCapture();

    await handler(
      {
        method: "POST",
        body: validPayload,
        headers: { "x-admin-token": "wrong", "content-type": "application/json" }
      },
      res
    );

    expect(captured.statusCode).toBe(401);
    expect(captured.payload).toEqual({ error: "Unauthorized" });
  });

  it("validates lockType and unlockAt for time lock", async () => {
    process.env.CMS_ADMIN_TOKEN = "secret";
    const { captured, res } = createResponseCapture();

    await handler(
      {
        method: "POST",
        headers: {
          "x-admin-token": "secret",
          "content-type": "application/json",
          "x-actor-id": "user-123"
        },
        body: {
          ...validPayload,
          lockType: "time"
        }
      },
      res
    );

    expect(captured.statusCode).toBe(400);
    expect(captured.payload).toEqual({ error: "unlockAt must be a valid ISO datetime for time lock" });
  });

  it("validates id format", async () => {
    process.env.CMS_ADMIN_TOKEN = "secret";
    const { captured, res } = createResponseCapture();

    await handler(
      {
        method: "POST",
        headers: {
          "x-admin-token": "secret",
          "content-type": "application/json",
          "x-actor-id": "user-123"
        },
        body: {
          ...validPayload,
          id: "bad id"
        }
      },
      res
    );

    expect(captured.statusCode).toBe(400);
    expect(captured.payload).toEqual({ error: "id may only include letters, numbers, and hyphens" });
  });

  it("validates media url scheme", async () => {
    process.env.CMS_ADMIN_TOKEN = "secret";
    const { captured, res } = createResponseCapture();

    await handler(
      {
        method: "POST",
        headers: {
          "x-admin-token": "secret",
          "content-type": "application/json",
          "x-actor-id": "user-123"
        },
        body: {
          ...validPayload,
          media: [{ kind: "image", src: "ftp://example.com/a.jpg" }]
        }
      },
      res
    );

    expect(captured.statusCode).toBe(400);
    expect(captured.payload).toEqual({ error: "media items must include valid kind and src" });
  });

  it("validates title/preview/content length limits", async () => {
    process.env.CMS_ADMIN_TOKEN = "secret";

    const titleCase = createResponseCapture();
    await handler(
      {
        method: "POST",
        headers: {
          "x-admin-token": "secret",
          "content-type": "application/json",
          "x-actor-id": "user-123"
        },
        body: {
          ...validPayload,
          title: "x".repeat(121)
        }
      },
      titleCase.res
    );
    expect(titleCase.captured.statusCode).toBe(400);
    expect(titleCase.captured.payload).toEqual({ error: "title must be 120 characters or less" });

    const previewCase = createResponseCapture();
    await handler(
      {
        method: "POST",
        headers: {
          "x-admin-token": "secret",
          "content-type": "application/json",
          "x-actor-id": "user-123"
        },
        body: {
          ...validPayload,
          preview: "x".repeat(241)
        }
      },
      previewCase.res
    );
    expect(previewCase.captured.statusCode).toBe(400);
    expect(previewCase.captured.payload).toEqual({ error: "preview must be 240 characters or less" });

    const contentCase = createResponseCapture();
    await handler(
      {
        method: "POST",
        headers: {
          "x-admin-token": "secret",
          "content-type": "application/json",
          "x-actor-id": "user-123"
        },
        body: {
          ...validPayload,
          content: "x".repeat(6_001)
        }
      },
      contentCase.res
    );
    expect(contentCase.captured.statusCode).toBe(400);
    expect(contentCase.captured.payload).toEqual({ error: "content must be 6000 characters or less" });
  });

  it("accepts a valid update request", async () => {
    process.env.CMS_ADMIN_TOKEN = "secret";
    const { captured, res } = createResponseCapture();

    await handler(
      {
        method: "POST",
        headers: {
          "x-admin-token": "secret",
          "content-type": "application/json",
          "x-actor-id": "user-123"
        },
        body: validPayload
      },
      res
    );

    expect(captured.statusCode).toBe(202);
    expect(captured.payload).toMatchObject({
      accepted: true,
      event: {
        type: "letter-update",
        id: "sad-day",
        lockType: "honor",
        mediaCount: 1,
        updatedBy: "user-123"
      },
      letter: {
        id: "sad-day",
        updatedBy: "user-123"
      }
    });

    expect(captured.payload).toEqual(
      expect.objectContaining({
        letter: expect.objectContaining({
          updatedAt: expect.any(String)
        })
      })
    );
  });

  it("returns 429 when rate limit is exceeded", async () => {
    process.env.CMS_ADMIN_TOKEN = "secret";

    for (let index = 0; index < 10; index += 1) {
      const { captured, res } = createResponseCapture();
      await handler(
        {
          method: "POST",
          headers: {
            "x-admin-token": "secret",
            "x-client-key": "cms-client",
            "content-type": "application/json",
            "x-actor-id": "user-123"
          },
          body: validPayload
        },
        res
      );

      expect(captured.statusCode).not.toBe(429);
    }

    const limited = createResponseCapture();
    await handler(
      {
        method: "POST",
        headers: {
          "x-admin-token": "secret",
          "x-client-key": "cms-client",
          "content-type": "application/json",
          "x-actor-id": "user-123"
        },
        body: validPayload
      },
      limited.res
    );

    expect(limited.captured.statusCode).toBe(429);
    expect(limited.captured.payload).toEqual({ error: "Too many requests" });
  });

  it("rejects requests from disallowed origins", async () => {
    process.env.CMS_ADMIN_TOKEN = "secret";
    process.env.OPEN_ME_ALLOWED_ORIGINS = "https://app.openme.example";
    const { captured, res } = createResponseCapture();

    await handler(
      {
        method: "POST",
        headers: {
          "x-admin-token": "secret",
          "content-type": "application/json",
          "x-actor-id": "user-123",
          origin: "https://evil.example"
        },
        body: validPayload
      },
      res
    );

    expect(captured.statusCode).toBe(403);
    expect(captured.payload).toEqual({ error: "Origin not allowed" });
  });

  it("requires actor id for authorized cms update", async () => {
    process.env.CMS_ADMIN_TOKEN = "secret";
    const { captured, res } = createResponseCapture();

    await handler(
      {
        method: "POST",
        headers: {
          "x-admin-token": "secret",
          "content-type": "application/json"
        },
        body: validPayload
      },
      res
    );

    expect(captured.statusCode).toBe(401);
    expect(captured.payload).toEqual({ error: "Authenticated actor is required" });
  });
});
