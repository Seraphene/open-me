type LockType = "honor" | "time";
type MediaKind = "image" | "audio" | "video";

type MediaBlock = {
  kind: MediaKind;
  src: string;
  alt?: string;
};

type LetterUpdatePayload = {
  id?: string;
  title?: string;
  preview?: string;
  content?: string;
  lockType?: LockType;
  unlockAt?: string;
  media?: MediaBlock[];
};

type RequestBody = {
  method?: string;
  body?: LetterUpdatePayload;
  headers?: Record<string, string | undefined>;
};

type ResponseWriter = {
  status: (code: number) => { json: (payload: unknown) => void };
};

function isIsoDate(value: string) {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && value.includes("T");
}

function hasValidMedia(media?: MediaBlock[]) {
  if (!media) {
    return true;
  }

  return media.every((item) =>
    Boolean(item?.src?.trim()) &&
    (item.kind === "image" || item.kind === "audio" || item.kind === "video")
  );
}

export default function handler(req: RequestBody, res: ResponseWriter) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const adminToken = process.env.CMS_ADMIN_TOKEN;
  if (!adminToken) {
    return res.status(503).json({ error: "CMS_ADMIN_TOKEN is not configured" });
  }

  const requestToken = req.headers?.["x-admin-token"];
  if (!requestToken || requestToken !== adminToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const payload = req.body;
  if (!payload?.id?.trim()) {
    return res.status(400).json({ error: "id is required" });
  }

  if (!payload.title?.trim()) {
    return res.status(400).json({ error: "title is required" });
  }

  if (!payload.preview?.trim()) {
    return res.status(400).json({ error: "preview is required" });
  }

  if (!payload.content?.trim()) {
    return res.status(400).json({ error: "content is required" });
  }

  if (payload.lockType !== "honor" && payload.lockType !== "time") {
    return res.status(400).json({ error: "lockType must be honor or time" });
  }

  if (payload.lockType === "time" && (!payload.unlockAt || !isIsoDate(payload.unlockAt))) {
    return res.status(400).json({ error: "unlockAt must be a valid ISO datetime for time lock" });
  }

  if (payload.lockType === "honor" && payload.unlockAt) {
    return res.status(400).json({ error: "unlockAt is not allowed for honor lock" });
  }

  if (!hasValidMedia(payload.media)) {
    return res.status(400).json({ error: "media items must include valid kind and src" });
  }

  return res.status(202).json({
    accepted: true,
    event: {
      type: "letter-update",
      id: payload.id,
      lockType: payload.lockType,
      mediaCount: payload.media?.length ?? 0
    }
  });
}
