import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { ROUTES } from '@/lib/constants';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (pathname.startsWith('/admin') && pathname !== ROUTES.ADMIN_LOGIN) {
      if (!token) {
        return NextResponse.redirect(new URL(ROUTES.PARTICIPANT_LOGIN, req.url));
      }

      if (token.role === 'participant') {
        return NextResponse.redirect(new URL(ROUTES.DASHBOARD, req.url));
      }

      return NextResponse.next();
    }

    if (
      pathname.startsWith('/dashboard') ||
      pathname === ROUTES.ETHICS ||
      pathname.startsWith('/submissions')
    ) {
      if (!token) {
        return NextResponse.redirect(new URL(ROUTES.PARTICIPANT_LOGIN, req.url));
      }

      if (token.role === 'admin') {
        return NextResponse.redirect(new URL(ROUTES.ADMIN_DASHBOARD, req.url));
      }

      return NextResponse.next();
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        if (pathname === ROUTES.ADMIN_LOGIN) {
          return true;
        }

        return Boolean(token);
      },
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/ethics',
    '/submissions',
    '/submissions/:path*',
  ],
};
