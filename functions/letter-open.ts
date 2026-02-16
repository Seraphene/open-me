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
