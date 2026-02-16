import { sendEmergencyNotification } from "./gmail-transport";
import {
  applyWriteEndpointSecurityHeaders,
  getRequestClientKey,
  handleWriteEndpointPreflight,
  hitRateLimit,
  validateCorsOrigin,
  validateJsonWriteRequest
} from "./security";

type EmergencyNotifyPayload = {
  message: string;
  recipientEmail?: string;
  context?: string;
};

type RequestBody = {
  method?: string;
  body?: EmergencyNotifyPayload;
  headers?: Record<string, string | undefined>;
};

type ResponseWriter = {
  status: (code: number) => { json: (payload: unknown) => void };
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default async function handler(req: RequestBody, res: ResponseWriter) {
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

  const clientKey = getRequestClientKey(req.headers);
  const limited = hitRateLimit({
    scope: "emergency-notify",
    clientKey,
    maxRequests: 3,
    windowMs: 60_000
  });

  if (limited) {
    return res.status(429).json({ error: "Too many requests" });
  }

  const payload = req.body;
  if (!payload?.message?.trim()) {
    return res.status(400).json({ error: "message is required" });
  }

  if (payload.message.trim().length > 1000) {
    return res.status(400).json({ error: "message must be 1000 characters or less" });
  }

  if (payload.context && payload.context.trim().length > 1000) {
    return res.status(400).json({ error: "context must be 1000 characters or less" });
  }

  const targetEmail = payload.recipientEmail ?? process.env.EMERGENCY_RECIPIENT_EMAIL;
  if (!targetEmail) {
    return res.status(400).json({ error: "recipientEmail or EMERGENCY_RECIPIENT_EMAIL is required" });
  }

  if (!isValidEmail(targetEmail)) {
    return res.status(400).json({ error: "recipientEmail must be a valid email" });
  }

  const notifyResult = await sendEmergencyNotification({
    to: targetEmail,
    subject: "Open Me emergency support request",
    text: payload.context
      ? `${payload.message}\n\nContext: ${payload.context}`
      : payload.message
  });

  if (notifyResult.delivered) {
    return res.status(200).json({
      accepted: true,
      delivered: true,
      provider: notifyResult.provider,
      message: "Emergency notification delivered"
    });
  }

  return res.status(503).json({
    accepted: false,
    delivered: false,
    provider: notifyResult.provider,
    message: notifyResult.details
  });
}
