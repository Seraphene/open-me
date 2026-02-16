type LockType = "honor" | "time";
type MediaKind = "image" | "audio" | "video";
import {
  applyWriteEndpointSecurityHeaders,
  getRequestClientKey,
  handleWriteEndpointPreflight,
  hitRateLimit,
  validateCorsOrigin,
  validateJsonWriteRequest
} from "./security";
import { upsertLetter } from "./letters-store";

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
    /^https?:\/\//i.test(item.src.trim()) &&
    (item.kind === "image" || item.kind === "audio" || item.kind === "video")
  );
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

  const validation = validateJsonWriteRequest(req, { maxPayloadBytes: 8_192 });
  if (validation) {
    return res.status(validation.status).json({ error: validation.error });
  }

  const clientKey = getRequestClientKey(req.headers);
  const limited = hitRateLimit({
    scope: "letter-update",
    clientKey,
    maxRequests: 10,
    windowMs: 60_000
  });

  if (limited) {
    return res.status(429).json({ error: "Too many requests" });
  }

  const adminToken = process.env.CMS_ADMIN_TOKEN;
  if (!adminToken) {
    return res.status(503).json({ error: "CMS_ADMIN_TOKEN is not configured" });
  }

  const requestToken = req.headers?.["x-admin-token"];
  if (!requestToken || requestToken !== adminToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const actorId = req.headers?.["x-actor-id"]?.trim();
  if (!actorId) {
    return res.status(401).json({ error: "Authenticated actor is required" });
  }

  const payload = req.body;
  if (!payload?.id?.trim()) {
    return res.status(400).json({ error: "id is required" });
  }

  if (!/^[a-z0-9-]+$/i.test(payload.id.trim())) {
    return res.status(400).json({ error: "id may only include letters, numbers, and hyphens" });
  }

  if (!payload.title?.trim()) {
    return res.status(400).json({ error: "title is required" });
  }

  if (payload.title.trim().length > 120) {
    return res.status(400).json({ error: "title must be 120 characters or less" });
  }

  if (!payload.preview?.trim()) {
    return res.status(400).json({ error: "preview is required" });
  }

  if (payload.preview.trim().length > 240) {
    return res.status(400).json({ error: "preview must be 240 characters or less" });
  }

  if (!payload.content?.trim()) {
    return res.status(400).json({ error: "content is required" });
  }

  if (payload.content.trim().length > 6_000) {
    return res.status(400).json({ error: "content must be 6000 characters or less" });
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

  const savedLetter = await upsertLetter({
    id: payload.id,
    title: payload.title,
    preview: payload.preview,
    content: payload.content,
    lockType: payload.lockType,
    unlockAt: payload.unlockAt,
    media: payload.media
  }, {
    updatedBy: actorId
  });

  return res.status(202).json({
    accepted: true,
    event: {
      type: "letter-update",
      id: payload.id,
      lockType: payload.lockType,
      mediaCount: payload.media?.length ?? 0,
      updatedAt: savedLetter.updatedAt,
      updatedBy: savedLetter.updatedBy ?? "system"
    },
    letter: savedLetter
  });
}
