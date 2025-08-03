// middleware.ts (in your root directory)
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired
  await supabase.auth.getSession();

  // Protect API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const { data: { session } } = await supabase.auth.getSession();
    
    // Allow webhook endpoints without auth
    if (req.nextUrl.pathname.startsWith('/api/stripe/webhook')) {
      return res;
    }
    
    // Require auth for all other API routes
    if (!session && !req.nextUrl.pathname.startsWith('/api/auth')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
  }

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
    
    // Check if user is admin
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', session.user.id)
      .single();
      
    const ADMIN_EMAILS = ['admin@legallylegitai.com.au'];
    if (!user || !ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*',
    '/dashboard/:path*',
  ],
};