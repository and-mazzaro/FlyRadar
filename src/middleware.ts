import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from './lib/supabase';

export async function middleware(request: NextRequest) {
  // Update session
  const res = await updateSession(request);

  // Read Supabase auth token
  const hasSession = request.cookies.getAll().some(c => c.name.startsWith('sb-'));

  const url = request.nextUrl.clone();

  // Route protection
  if (url.pathname.startsWith('/feed')) {
    if (!hasSession) {
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }
  }

  if (url.pathname.startsWith('/auth/')) {
    if (hasSession) {
      url.pathname = '/feed';
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/feed/:path*',
    '/auth/:path*',
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\..*|$).*)',
  ],
};
