import {
  applyWriteEndpointSecurityHeaders,
  handleWriteEndpointPreflight,
  validateCorsOrigin,
  validateJsonWriteRequest
} from "./security";

type LockType = "honor" | "time";

type UnlockRequest = {
  lockType: LockType;
  now?: string;
  unlockAt?: string;
  honorConfirmed?: boolean;
};

type RequestBody = {
  method?: string;
  body?: UnlockRequest;
  headers?: Record<string, string | undefined>;
};

type ResponseWriter = {
  status: (code: number) => { json: (payload: unknown) => void };
};

export default function handler(req: RequestBody, res: ResponseWriter) {
  applyWriteEndpointSecurityHeaders(res);

  if (handleWriteEndpointPreflight(req, res)) {
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const corsValidation = validateCorsOrigin(req, res);
  if (corsValidation) {
    return res.status(corsValidation.status).json({ error: corsValidation.error });
  }

  const validation = validateJsonWriteRequest(req, { maxPayloadBytes: 2_048 });
  if (validation) {
    return res.status(validation.status).json({ error: validation.error });
  }

  const body = req.body as UnlockRequest;

  if (!body?.lockType) {
    return res.status(400).json({ error: "lockType is required" });
  }

  if (body.lockType === "honor") {
    return res.status(200).json({ unlocked: Boolean(body.honorConfirmed) });
  }

  const now = body.now ? new Date(body.now) : new Date();
  const unlockAt = body.unlockAt ? new Date(body.unlockAt) : null;

  if (!unlockAt || Number.isNaN(unlockAt.getTime())) {
    return res.status(400).json({ error: "valid unlockAt is required for time lock" });
  }

  return res.status(200).json({ unlocked: now >= unlockAt });
}
