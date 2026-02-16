import { describe, expect, it } from "vitest";
import handler from "../../functions/read-receipt";

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

describe("read-receipt", () => {
  it("accepts OPTIONS preflight", () => {
    const { captured, res } = createResponseCapture();

    handler({ method: "OPTIONS" }, res);

    expect(captured.statusCode).toBe(204);
    expect(captured.payload).toEqual({ ok: true });
  });

  it("rejects non-POST methods", () => {
    const { captured, res } = createResponseCapture();

    handler({ method: "GET" }, res);

    expect(captured.statusCode).toBe(405);
    expect(captured.payload).toEqual({ error: "Method not allowed" });
  });

  it("rejects missing required fields", () => {
    const { captured, res } = createResponseCapture();

    handler(
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: { openedAt: "2026-02-16T21:00:00.000Z" }
      },
      res
    );

    expect(captured.statusCode).toBe(400);
    expect(captured.payload).toEqual({ error: "letterId is required" });
  });

  it("rejects invalid openedAt format", () => {
    const { captured, res } = createResponseCapture();

    handler(
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: {
          letterId: "sad-day",
          openedAt: "not-a-date"
        }
      },
      res
    );

    expect(captured.statusCode).toBe(400);
    expect(captured.payload).toEqual({ error: "openedAt must be a valid ISO datetime" });
  });

  it("accepts a valid read receipt payload", () => {
    const { captured, res } = createResponseCapture();

    handler(
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: {
          letterId: "sad-day",
          openedAt: "2026-02-16T21:00:00.000Z",
          recipientId: "partner-1",
          deviceType: "mobile"
        }
      },
      res
    );

    expect(captured.statusCode).toBe(202);
    expect(captured.payload).toMatchObject({
      accepted: true,
      event: {
        type: "read-receipt",
        letterId: "sad-day",
        recipientId: "partner-1",
        deviceType: "mobile"
      }
    });
  });

  it("rejects oversized payload", () => {
    const { captured, res } = createResponseCapture();

    handler(
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: {
          letterId: "sad-day",
          openedAt: "2026-02-16T21:00:00.000Z",
          recipientId: "x".repeat(10_000)
        }
      },
      res
    );

    expect(captured.statusCode).toBe(413);
    expect(captured.payload).toEqual({ error: "Payload too large" });
  });
});
