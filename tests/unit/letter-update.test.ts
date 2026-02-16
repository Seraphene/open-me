import { afterEach, describe, expect, it } from "vitest";
import handler from "../../functions/letter-update";

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
});

describe("letter-update", () => {
  it("rejects non-POST methods", () => {
    process.env.CMS_ADMIN_TOKEN = "secret";
    const { captured, res } = createResponseCapture();

    handler({ method: "GET" }, res);

    expect(captured.statusCode).toBe(405);
  });

  it("rejects when admin token is missing", () => {
    const { captured, res } = createResponseCapture();

    handler({ method: "POST", body: validPayload, headers: { "x-admin-token": "secret" } }, res);

    expect(captured.statusCode).toBe(503);
  });

  it("rejects unauthorized requests", () => {
    process.env.CMS_ADMIN_TOKEN = "secret";
    const { captured, res } = createResponseCapture();

    handler({ method: "POST", body: validPayload, headers: { "x-admin-token": "wrong" } }, res);

    expect(captured.statusCode).toBe(401);
    expect(captured.payload).toEqual({ error: "Unauthorized" });
  });

  it("validates lockType and unlockAt for time lock", () => {
    process.env.CMS_ADMIN_TOKEN = "secret";
    const { captured, res } = createResponseCapture();

    handler(
      {
        method: "POST",
        headers: { "x-admin-token": "secret" },
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

  it("accepts a valid update request", () => {
    process.env.CMS_ADMIN_TOKEN = "secret";
    const { captured, res } = createResponseCapture();

    handler(
      {
        method: "POST",
        headers: { "x-admin-token": "secret" },
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
        mediaCount: 1
      }
    });
  });
});
