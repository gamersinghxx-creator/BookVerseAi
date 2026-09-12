import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { withTimeout } from "@/lib/resilience";

// Runs on every request (Next.js "proxy", formerly "middleware"). Its only job
// is to refresh the Supabase auth session so Server Components see a fresh user.
//
// When auth is not configured (no public URL / anon key) it is a transparent
// pass-through. The session touch is time-boxed so a slow or dead Supabase can
// never stall request handling — the app keeps working, just signed-out.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const SESSION_REFRESH_TIMEOUT_MS = 2000;

export async function proxy(request: NextRequest) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options?: CookieOptions }[],
      ) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Touch the session to trigger a refresh + cookie rotation. Bounded so a dead
  // Supabase degrades to "signed out" instead of hanging every route.
  try {
    await withTimeout("supabase-session", SESSION_REFRESH_TIMEOUT_MS, () =>
      supabase.auth.getUser(),
    );
  } catch {
    // Ignore: the request proceeds unauthenticated.
  }

  return response;
}

export const config = {
  matcher: [
    // Everything except static assets and image files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
