import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Usa getUser() — più affidabile del controllo manuale dei cookie
  const { data: { user } } = await supabase.auth.getUser();
  const url = request.nextUrl.clone();

  // Proteggi /feed: se non autenticato → login
  if (url.pathname.startsWith('/feed') && !user) {
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // Se già autenticato su /auth/* → vai al feed (eccetto callback)
  if (url.pathname.startsWith('/auth/') && !url.pathname.startsWith('/auth/callback') && user) {
    url.pathname = '/feed';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/feed/:path*',
    '/auth/:path*',
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\..*|$).*)',
  ],
};
