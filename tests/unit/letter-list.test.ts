import { afterEach, describe, expect, it } from "vitest";
import listHandler from "../../functions/letter-list";
import updateHandler from "../../functions/letter-update";
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

afterEach(() => {
  __resetLetterStore();
  __resetRateLimitState();
  delete process.env.CMS_ADMIN_TOKEN;
  delete process.env.OPEN_ME_ALLOWED_ORIGINS;
  delete process.env.ALLOWED_ORIGINS;
});

describe("letter-list", () => {
  it("rejects non-GET methods", async () => {
    const { captured, res } = createResponseCapture();

    await listHandler({ method: "POST" }, res);

    expect(captured.statusCode).toBe(405);
    expect(captured.payload).toEqual({ error: "Method not allowed" });
  });

  it("returns letters", async () => {
    const { captured, res } = createResponseCapture();

    await listHandler({ method: "GET" }, res);

    expect(captured.statusCode).toBe(200);
    expect(captured.payload).toMatchObject({
      letters: expect.any(Array)
    });
  });

  it("reflects updates after cms write", async () => {
    process.env.CMS_ADMIN_TOKEN = "secret";

    const update = createResponseCapture();
    await updateHandler(
      {
        method: "POST",
        headers: {
          "x-admin-token": "secret",
          "content-type": "application/json",
          "x-actor-id": "user-123"
        },
        body: {
          id: "sad-day",
          title: "Open when you feel sad",
          preview: "Updated preview",
          content: "Updated content",
          lockType: "honor"
        }
      },
      update.res
    );

    expect(update.captured.statusCode).toBe(202);

    const listed = createResponseCapture();
    await listHandler({ method: "GET" }, listed.res);

    expect(listed.captured.statusCode).toBe(200);
    expect(listed.captured.payload).toMatchObject({
      letters: expect.arrayContaining([
        expect.objectContaining({
          id: "sad-day",
          preview: "Updated preview",
          content: "Updated content"
        })
      ])
    });
  });
});
