import { applyWriteEndpointSecurityHeaders, handleWriteEndpointPreflight, validateCorsOrigin } from "./security";
import { listLetters } from "./letters-store";

type RequestBody = {
  method?: string;
  headers?: Record<string, string | undefined>;
};

type ResponseWriter = {
  setHeader?: (name: string, value: string) => void;
  status: (code: number) => { json: (payload: unknown) => void };
};

export default async function handler(req: RequestBody, res: ResponseWriter) {
  applyWriteEndpointSecurityHeaders(res);

  if (handleWriteEndpointPreflight(req, res)) {
    return;
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const corsValidation = validateCorsOrigin(req, res);
  if (corsValidation) {
    return res.status(corsValidation.status).json({ error: corsValidation.error });
  }

  return res.status(200).json({
    letters: await listLetters()
  });
}
