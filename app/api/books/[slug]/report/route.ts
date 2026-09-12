import { getBookBySlug, isSeedSlug } from "@/lib/store";
import { route, parseJson, badRequest, notFound } from "@/lib/http";
import type { LimitRule } from "@/lib/rate-limit";
import { z } from "zod";
import { track } from "@/lib/observability";

const REPORT_LIMITS: LimitRule[] = [
  { name: "report-min", windowMs: 60_000, max: 5 },
  { name: "report-day", windowMs: 86_400_000, max: 50 },
];

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ReportInput = z.object({
  reason: z.enum(["inaccurate", "low-quality", "inappropriate", "other"]),
  note: z.string().max(500).optional(),
});

// Flag a generated guide as bad. v1: recorded to logs + analytics for an admin
// to review (a `reports` table is a documented follow-up in docs/BOARD.md).
export const POST = route(
  "books.report",
  { limit: REPORT_LIMITS },
  async (req, ctx) => {
    const slug = ctx.params.slug;
    if (!slug) throw badRequest("Missing slug");
    if (isSeedSlug(slug)) throw badRequest("Seed books can't be reported here");

    const { reason, note } = await parseJson(req, ReportInput);
    if (!(await getBookBySlug(slug))) throw notFound("No book with that slug");

    ctx.log.warn("book.reported", { slug, reason, note });
    track("book.reported", { slug, reason });
    return ctx.json({ ok: true });
  },
);
