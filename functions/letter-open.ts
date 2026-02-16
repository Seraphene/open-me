import {
  applyWriteEndpointSecurityHeaders,
  handleWriteEndpointPreflight,
  validateCorsOrigin,
  validateJsonWriteRequest
} from "./security";

type LockType = "honor" | "time";

type LetterOpenPayload = {
  letterId?: string;
  openedAt?: string;
  lockType?: LockType;
  unlocked?: boolean;
  userId?: string;
};

type RequestBody = {
  method?: string;
  body?: LetterOpenPayload;
  headers?: Record<string, string | undefined>;
};

type ResponseWriter = {
  status: (code: number) => { json: (payload: unknown) => void };
};

function isIsoDate(value: string) {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && value.includes("T");
}

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

  const validation = validateJsonWriteRequest(req, { maxPayloadBytes: 4_096 });
  if (validation) {
    return res.status(validation.status).json({ error: validation.error });
  }

  const payload = req.body;
  if (!payload?.letterId?.trim()) {
    return res.status(400).json({ error: "letterId is required" });
  }

  if (!payload.openedAt?.trim() || !isIsoDate(payload.openedAt)) {
    return res.status(400).json({ error: "openedAt must be a valid ISO datetime" });
  }

  if (payload.lockType !== "honor" && payload.lockType !== "time") {
    return res.status(400).json({ error: "lockType must be honor or time" });
  }

  if (typeof payload.unlocked !== "boolean") {
    return res.status(400).json({ error: "unlocked must be provided" });
  }

  return res.status(202).json({
    accepted: true,
    event: {
      type: "letter-open",
      letterId: payload.letterId,
      openedAt: payload.openedAt,
      lockType: payload.lockType,
      unlocked: payload.unlocked,
      userId: payload.userId ?? "anonymous"
    }
  });
}
