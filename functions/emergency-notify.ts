import { sendEmergencyNotification } from "./gmail-transport";

type EmergencyNotifyPayload = {
  message: string;
  recipientEmail?: string;
  context?: string;
};

type RequestBody = {
  method?: string;
  body?: EmergencyNotifyPayload;
};

type ResponseWriter = {
  status: (code: number) => { json: (payload: unknown) => void };
};

export default async function handler(req: RequestBody, res: ResponseWriter) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const payload = req.body;
  if (!payload?.message?.trim()) {
    return res.status(400).json({ error: "message is required" });
  }

  const targetEmail = payload.recipientEmail ?? process.env.EMERGENCY_RECIPIENT_EMAIL;
  if (!targetEmail) {
    return res.status(400).json({ error: "recipientEmail or EMERGENCY_RECIPIENT_EMAIL is required" });
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
