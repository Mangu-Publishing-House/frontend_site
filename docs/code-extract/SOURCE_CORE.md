# Architectural source — `my_publishing` @ `cb3950c7`

Full source of the two provider switches and Edge middleware. Layout / homepage / Next config are summarized with file pointers; they are too long to duplicate twice without drift.

Read live files:

- `app/layout.tsx`
- `app/page.tsx`
- `app/providers.tsx`
- `next.config.js`
- `package.json`
- `app/api/health/route.ts`

---

## `lib/auth/provider.ts`

```ts
/**
 * Auth-provider switch for Phoenix dual-run (WS1).
 *
 * AUTH_PROVIDER=supabase|better-auth
 * Default remains supabase so the public site keeps working until
 * Phase 11–12 cutover flips AUTH_PROVIDER=better-auth in Vercel.
 */

export type AuthProvider = 'supabase' | 'better-auth';

export function getAuthProvider(): AuthProvider {
  const raw = (process.env.AUTH_PROVIDER || 'supabase').toLowerCase();
  if (raw === 'better-auth' || raw === 'betterauth' || raw === 'ba') {
    return 'better-auth';
  }
  return 'supabase';
}

export function isBetterAuthPrimary(): boolean {
  return getAuthProvider() === 'better-auth';
}
```

---

## `lib/db/provider.ts`

```ts
/**
 * Data-platform provider switch (ADR-002).
 *
 * DATABASE_PROVIDER=mongodb|supabase
 * Default remains supabase until mongo-up sets mongodb in .env.local.
 */

export type DatabaseProvider = 'mongodb' | 'supabase';

export function getDatabaseProvider(): DatabaseProvider {
  const raw = (process.env.DATABASE_PROVIDER || 'supabase').toLowerCase();
  if (raw === 'mongodb' || raw === 'mongo') return 'mongodb';
  return 'supabase';
}

export function isMongoPrimary(): boolean {
  return getDatabaseProvider() === 'mongodb';
}
```

---

## `app/layout.tsx` — what it actually does

- Loads Inter locally from `@fontsource/inter` (400 + 700) as `--font-inter`.
- Metadata: default title `MANGU Publishers - Digital Publishing Platform`, template `%s | MANGU Publishers`.
- Description is honest catalog copy (no streaming / unlimited-reading claims).
- `metadataBase` from `getSiteUrl()`; OG + Twitter large image `/og-image.png`.
- Viewport: dark `#0a0a0a`, width device-width, maxScale 5.
- Renders `Providers` → `Header` → `<main id="main-content" tabIndex={-1}>` → `Footer`.
- Footer newsletter band only when `isEmailConfigured()` is true.
- JSON-LD: Organization + WebSite with search URL `/books?search={search_term_string}`.

---

## `app/page.tsx` — what it actually does

- Hero gradient, oversized gold “MANGU / PUBLISHING” title.
- CTAs: `/books` and `/about`.
- Sections: `FeaturedBooksSection`, `TrendingBooksSection`, Resonance `RecommendationsRail` (`/api/resonance/recommend?mode=auto&limit=12`), `BecauseYouReadRail`, `StatsBarSection`, `GenreExplorer`, `AuthorSpotlight`, `NewsletterCTA`.

---

## `next.config.js` — what it actually does

- `output: 'standalone'` except on Windows.
- CSP: self + Stripe JS/checkout + `*.supabase.co` (https + wss) + Sentry ingest. Notes `unsafe-inline` / `unsafe-eval` as Next 14 constraints.
- Production-only HSTS; `X-Frame-Options: DENY`; nosniff; Permissions-Policy camera/mic/geo off.
- Images: `**.supabase.co`, `picsum.photos`, `*.public.blob.vercel-storage.com`.
- Server Actions `bodySizeLimit: '1mb'`.
- Optional `@next/bundle-analyzer` when `ANALYZE=true`.
- Sentry wrapper only when DSN is set.

---

## `middleware.ts` (full source at extract SHA)

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';
import { getAuthProvider } from '@/lib/auth/provider';
import { enforceRateLimit, getRateLimitIdentity } from '@/lib/rate-limit';
import { buildRateLimitResponse } from '@/lib/rate-limit-response';
import { getEdgeAuthUser, getEdgeUserRole } from '@/lib/supabase/edge-auth';

function rateLimitRejection(
  request: NextRequest,
  result: { reason: string; headers: Record<string, string> }
) {
  return buildRateLimitResponse(request, result);
}

function authUnavailableResponse(request: NextRequest) {
  const isApi = request.nextUrl.pathname.startsWith('/api/');
  const body = isApi
    ? JSON.stringify({
        error: 'auth_unavailable',
        message: 'Authentication is temporarily unavailable.',
      })
    : 'Authentication is temporarily unavailable. Please try again shortly.';

  return new NextResponse(body, {
    status: 503,
    headers: {
      'Content-Type': isApi ? 'application/json' : 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function loginRedirect(request: NextRequest, pathname: string) {
  const url = new URL('/login', request.url);
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

function isProtectedPath(pathname: string): boolean {
  const isReadingRoute = pathname.startsWith('/reading');
  const isLibraryRoute = pathname.startsWith('/library');
  const isAuthorRoute = pathname === '/author' || pathname.startsWith('/author/');
  const isPartnerRoute = pathname === '/partner' || pathname.startsWith('/partner/');
  const isAdminRoute = pathname.startsWith('/admin');
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isFilesApi = pathname.startsWith('/api/files');
  return (
    isReadingRoute ||
    isLibraryRoute ||
    isAuthorRoute ||
    isPartnerRoute ||
    isAdminRoute ||
    isDashboardRoute ||
    isFilesApi
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  const isAuthApiPath = pathname.startsWith('/api/auth/');
  const isAuthPageAction =
    method === 'POST' &&
    (pathname.startsWith('/login') ||
      pathname.startsWith('/register') ||
      pathname.startsWith('/reset-password') ||
      pathname.startsWith('/verify-email'));

  if (isAuthApiPath || isAuthPageAction) {
    const ip = request.ip ?? getRateLimitIdentity(request);
    const result = await enforceRateLimit('auth', ip);
    if (!result.success) {
      return rateLimitRejection(request, result);
    }
  }

  if (pathname.startsWith('/api/upload')) {
    const ip = request.ip ?? getRateLimitIdentity(request);
    const result = await enforceRateLimit('upload', ip);
    if (!result.success) {
      return rateLimitRejection(request, result);
    }
  }

  const isAbusablePublicPost =
    method === 'POST' &&
    (pathname.startsWith('/api/newsletter') || pathname.startsWith('/api/checkout'));

  if (isAbusablePublicPost) {
    const ip = request.ip ?? getRateLimitIdentity(request);
    const result = await enforceRateLimit('api', ip);
    if (!result.success) {
      return rateLimitRejection(request, result);
    }
  }

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const isPasswordRecoveryConfirm = pathname === '/reset-password/confirm';
  const authRoutes = ['/login', '/register', '/reset-password'];
  const isAuthRoute =
    !isPasswordRecoveryConfirm && authRoutes.some((route) => pathname.startsWith(route));

  const isAuthorRoute = pathname === '/author' || pathname.startsWith('/author/');
  const isPartnerRoute = pathname === '/partner' || pathname.startsWith('/partner/');
  const isAdminRoute = pathname.startsWith('/admin');

  try {
    if (getAuthProvider() === 'better-auth') {
      const sessionCookie = getSessionCookie(request);
      const userId = sessionCookie ? 'session' : null;

      if (userId && isAuthRoute) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      if (!userId && isProtectedPath(pathname)) {
        return loginRedirect(request, pathname);
      }

      return response;
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error(
        'Missing Supabase environment variables — Edge auth cannot be verified. ' +
          'Protected routes are denied (fail-closed). See .env.local.example.'
      );

      if (isProtectedPath(pathname)) {
        return authUnavailableResponse(request);
      }

      return response;
    }

    const needsAuthResolution =
      isProtectedPath(pathname) || ((method === 'GET' || method === 'HEAD') && isAuthRoute);

    if (!needsAuthResolution) {
      return response;
    }

    const authUser = await getEdgeAuthUser(request);
    const userId = authUser.userId;

    if (userId && isAuthRoute) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (!userId && isProtectedPath(pathname)) {
      return loginRedirect(request, pathname);
    }

    if (userId && authUser.accessToken && (isAdminRoute || isAuthorRoute || isPartnerRoute)) {
      let role: string | undefined;

      try {
        role = await getEdgeUserRole(authUser.accessToken, userId);
        if (!role) {
          console.error('Error fetching profile for role check: missing role');
          return NextResponse.redirect(new URL('/', request.url));
        }
      } catch (error) {
        console.error('Error in role-based route protection:', error);
        return NextResponse.redirect(new URL('/', request.url));
      }

      if (isAdminRoute && role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }

      if (isAuthorRoute && role !== 'author' && role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }

      if (isPartnerRoute && role !== 'partner' && role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    return response;
  } catch (error) {
    console.error('Middleware error — failing closed:', error);

    const passThroughRoutes = [
      '/login',
      '/register',
      '/reset-password',
      '/verify-email',
      '/api/auth',
      '/api/upload',
      '/api/newsletter',
      '/api/checkout',
    ];
    const isPassThrough =
      !isProtectedPath(pathname) && passThroughRoutes.some((route) => pathname.startsWith(route));

    if (isPassThrough) {
      return response;
    }

    return pathname.startsWith('/api/')
      ? authUnavailableResponse(request)
      : loginRedirect(request, pathname);
  }
}

export const config = {
  matcher: [
    '/reading',
    '/reading/:path*',
    '/library',
    '/library/:path*',
    '/author',
    '/author/:path*',
    '/partner',
    '/partner/:path*',
    '/admin',
    '/admin/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/api/files',
    '/api/files/:path*',
    '/api/auth',
    '/api/auth/:path*',
    '/api/upload',
    '/api/upload/:path*',
    '/api/newsletter',
    '/api/newsletter/:path*',
    '/api/checkout',
    '/api/checkout/:path*',
    '/login',
    '/login/:path*',
    '/register',
    '/register/:path*',
    '/reset-password',
    '/reset-password/:path*',
    '/verify-email',
    '/verify-email/:path*',
  ],
};
```

Comments in the live file are longer (Task 1.5 / F-02 / C8 notes). Diff against `middleware.ts` on `main` if you change gates.
