import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { log, errMeta, type Logger } from "./log";
import { reportError } from "./observability";
import { checkRateLimit, clientId, type LimitRule } from "./rate-limit";

// Shared plumbing for API route handlers:
//   • a request id on every request (echoed as `x-request-id`)
//   • a request-scoped structured logger
//   • one JSON error envelope: { error: { code, message, requestId, details? } }
//   • typed body parsing via zod
//   • optional per-endpoint rate limiting
//   • 5xx errors forwarded to the observability sink
//
// Usage:
//   export const POST = route("generate", { limit: LIMITS.generate }, async (req, ctx) => {
//     const { title } = await parseJson(req, GenerateInput);
//     return ctx.json({ book });
//   });

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    requestId: string;
    details?: unknown;
  };
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
    readonly headers?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new ApiError(400, "bad_request", message, details);
export const notFound = (message = "Not found") =>
  new ApiError(404, "not_found", message);
export const upstream = (message = "An upstream service failed") =>
  new ApiError(502, "upstream_error", message);
export const tooManyRequests = (retryAfterSec: number) =>
  new ApiError(
    429,
    "rate_limited",
    "Too many requests — slow down.",
    { retryAfterSec },
    { "Retry-After": String(retryAfterSec) },
  );

export interface RouteContext {
  requestId: string;
  log: Logger;
  clientId: string;
  /** Route params for dynamic segments (e.g. `[slug]`). Empty for static routes. */
  params: Record<string, string>;
  /** JSON success response with the request id attached. */
  json: <T>(data: T, init?: ResponseInit) => Response;
}

type NextRouteContext = { params: Promise<Record<string, string>> } | undefined;
type Handler = (req: Request, ctx: RouteContext) => Promise<Response> | Response;

interface RouteOptions {
  /** Rate-limit rules applied per client id before the handler runs. */
  limit?: LimitRule[];
}

function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  if (err instanceof ZodError) {
    return new ApiError(400, "validation_error", "Request validation failed", err.issues);
  }
  return new ApiError(500, "internal_error", "Something went wrong");
}

export function route(
  name: string,
  handler: Handler,
): (req: Request, nextCtx?: NextRouteContext) => Promise<Response>;
export function route(
  name: string,
  options: RouteOptions,
  handler: Handler,
): (req: Request, nextCtx?: NextRouteContext) => Promise<Response>;
export function route(
  name: string,
  optionsOrHandler: RouteOptions | Handler,
  maybeHandler?: Handler,
) {
  const options: RouteOptions = typeof optionsOrHandler === "function" ? {} : optionsOrHandler;
  const handler: Handler =
    typeof optionsOrHandler === "function" ? optionsOrHandler : maybeHandler!;

  return async (req: Request, nextCtx?: NextRouteContext): Promise<Response> => {
    const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
    const id = clientId(req);
    const rlog = log.child({ route: name, requestId });
    const started = Date.now();
    const params = nextCtx ? await nextCtx.params : {};
    const ctx: RouteContext = {
      requestId,
      log: rlog,
      clientId: id,
      params,
      json: (data, init) => {
        const res = NextResponse.json(data, init);
        res.headers.set("x-request-id", requestId);
        return res;
      },
    };

    try {
      if (options.limit) {
        const rl = checkRateLimit(id, options.limit);
        if (!rl.ok) throw tooManyRequests(rl.retryAfterSec);
      }

      const res = await handler(req, ctx);
      res.headers.set("x-request-id", requestId);
      rlog.info("request.ok", {
        method: req.method,
        status: res.status,
        ms: Date.now() - started,
      });
      return res;
    } catch (err) {
      const apiErr = toApiError(err);
      const meta = {
        method: req.method,
        status: apiErr.status,
        code: apiErr.code,
        ms: Date.now() - started,
      };
      // 501 = a feature isn't configured on this deployment — expected, not an alert.
      if (apiErr.status >= 500 && apiErr.status !== 501) {
        rlog.error("request.error", { ...meta, ...errMeta(err) });
        reportError(err, { route: name, requestId });
      } else {
        rlog.warn("request.rejected", { ...meta, ...errMeta(err) });
      }

      const body: ApiErrorBody = {
        error: {
          code: apiErr.code,
          message: apiErr.message,
          requestId,
          ...(apiErr.details !== undefined ? { details: apiErr.details } : {}),
        },
      };
      const res = NextResponse.json(body, { status: apiErr.status });
      res.headers.set("x-request-id", requestId);
      for (const [k, v] of Object.entries(apiErr.headers ?? {})) res.headers.set(k, v);
      return res;
    }
  };
}

// Parse + validate a JSON request body. Throws `badRequest` on malformed JSON
// and a ZodError (-> 400 validation_error envelope) on shape mismatch.
export async function parseJson<T>(req: Request, schema: ZodType<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw badRequest("Request body must be valid JSON");
  }
  return schema.parse(raw);
}
