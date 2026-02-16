import {
  applyWriteEndpointSecurityHeaders,
  handleWriteEndpointPreflight,
  validateCorsOrigin,
  validateJsonWriteRequest
} from "./security";

type ReadReceiptPayload = {
  letterId?: string;
  openedAt?: string;
  recipientId?: string;
  deviceType?: "mobile" | "desktop" | "tablet" | "unknown";
};

type RequestBody = {
  method?: string;
  body?: ReadReceiptPayload;
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

  if (!payload.openedAt?.trim()) {
    return res.status(400).json({ error: "openedAt is required" });
  }

  if (!isIsoDate(payload.openedAt)) {
    return res.status(400).json({ error: "openedAt must be a valid ISO datetime" });
  }

  return res.status(202).json({
    accepted: true,
    event: {
      type: "read-receipt",
      letterId: payload.letterId,
      openedAt: payload.openedAt,
      recipientId: payload.recipientId ?? "anonymous",
      deviceType: payload.deviceType ?? "unknown"
    }
  });
}
