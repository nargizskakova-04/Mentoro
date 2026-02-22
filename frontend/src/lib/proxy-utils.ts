import { NextResponse } from 'next/server';

/** Forward all Set-Cookie headers from backend response to Next.js response (browser receives them). */
export function forwardSetCookieHeaders(backendRes: Response, nextRes: NextResponse): void {
  const headers = backendRes.headers as Headers & { getSetCookie?: () => string[] };
  const cookies = headers.getSetCookie?.() ?? (backendRes.headers.get('set-cookie') ? [backendRes.headers.get('set-cookie')!] : []);
  for (const cookie of cookies) {
    nextRes.headers.append('Set-Cookie', cookie);
  }
}
