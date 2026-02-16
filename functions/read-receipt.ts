type ReadReceiptPayload = {
  letterId?: string;
  openedAt?: string;
  recipientId?: string;
  deviceType?: "mobile" | "desktop" | "tablet" | "unknown";
};

type RequestBody = {
  method?: string;
  body?: ReadReceiptPayload;
};

type ResponseWriter = {
  status: (code: number) => { json: (payload: unknown) => void };
};

function isIsoDate(value: string) {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && value.includes("T");
}

export default function handler(req: RequestBody, res: ResponseWriter) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
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
