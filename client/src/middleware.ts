import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

const authPages = [
  "/auth/login",
  "/auth/signup",
  "/auth/logout",
  "/auth/forgot-password",
  "/auth/reset-password",
];

const protectedRoutes = [
  "/profile",
  "/dashboard",
  "/settings",
  "/my-recipes",
  "/saved-recipes",
];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (authPages.some((page) => path.startsWith(page))) {
    if (path !== "/auth/logout") {
      const token = await getToken({ req });

      if (token) {
        const returnUrl =
          req.nextUrl.searchParams.get("returnUrl") || "/profile";
        console.log(
          `[Middleware] User already authenticated, redirecting from ${path} to ${returnUrl}`
        );
        return NextResponse.redirect(new URL(returnUrl, req.url));
      }
    }

    return NextResponse.next();
  }

  if (protectedRoutes.some((route) => path.startsWith(route))) {
    const token = await getToken({ req });

    if (!token) {
      console.log(
        `[Middleware] Unauthenticated access attempt to ${path}, redirecting to login`
      );
      return NextResponse.redirect(
        new URL(`/auth/login?returnUrl=${encodeURIComponent(path)}`, req.url)
      );
    }
  }

  console.log(`[Middleware] Path: ${path}, allowing request to proceed`);
  return NextResponse.next();
}

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
  pages: {
    signIn: "/auth/login",
  },
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /fonts, /icons, /images (static assets)
     * 4. All root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|fonts|icons|images).*)",
  ],
};
