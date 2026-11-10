import { isIP } from "node:net";
import { getWaitlistService } from "../../../lib/waitlist/service";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  // The deployment proxy must overwrite these headers with the client address.
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0].trim();
  const real = request.headers.get("x-real-ip")?.trim();
  const ip = forwarded && isIP(forwarded) ? forwarded : real && isIP(real) ? real : "unknown";
  const input: unknown = await request.json().catch(() => undefined);
  const result = await getWaitlistService().signup(input, ip);
  return Response.json(result.body, {
    status: result.status,
    headers: { "Cache-Control": "no-store" },
  });
}
