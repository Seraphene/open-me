import { describe, expect, it } from "vitest";
import handler from "../../functions/letter-open";

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

describe("letter-open", () => {
  it("rejects non-POST methods", () => {
    const { captured, res } = createResponseCapture();

    handler({ method: "GET" }, res);

    expect(captured.statusCode).toBe(405);
  });

  it("validates required fields", () => {
    const { captured, res } = createResponseCapture();

    handler(
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: { letterId: "sad-day" }
      },
      res
    );

    expect(captured.statusCode).toBe(400);
    expect(captured.payload).toEqual({ error: "openedAt must be a valid ISO datetime" });
  });

  it("validates lockType", () => {
    const { captured, res } = createResponseCapture();

    handler(
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: {
          letterId: "sad-day",
          openedAt: "2026-02-16T22:10:00.000Z",
          lockType: "invalid" as "honor",
          unlocked: true
        }
      },
      res
    );

    expect(captured.statusCode).toBe(400);
    expect(captured.payload).toEqual({ error: "lockType must be honor or time" });
  });

  it("accepts valid payload", () => {
    const { captured, res } = createResponseCapture();

    handler(
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: {
          letterId: "sad-day",
          openedAt: "2026-02-16T22:10:00.000Z",
          lockType: "honor",
          unlocked: true,
          userId: "u-1"
        }
      },
      res
    );

    expect(captured.statusCode).toBe(202);
    expect(captured.payload).toMatchObject({
      accepted: true,
      event: {
        type: "letter-open",
        letterId: "sad-day",
        lockType: "honor",
        unlocked: true,
        userId: "u-1"
      }
    });
  });
});
