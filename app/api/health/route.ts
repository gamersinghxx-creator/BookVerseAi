import { getStatus } from "@/lib/ai";
import { route } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// AI backend status for the nav badge. The full model list is kept server-side;
// only what the UI needs is exposed.
export const GET = route("health", async (_req, ctx) => {
  const s = await getStatus();
  return ctx.json({
    provider: s.provider,
    available: s.available,
    model: s.model,
    modelReady: s.modelReady,
    verified: s.verified,
  });
});
