import { NextResponse } from 'next/server';

/** Clears the auth_token cookie so the browser no longer sends it (client-side logout). */
export async function POST() {
  const response = NextResponse.json({ message: 'Logged out' }, { status: 200 });
  response.cookies.set({
    name: 'auth_token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}

export async function GET() {
  return POST();
}
