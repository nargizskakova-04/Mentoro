import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/api-urls';
import { forwardSetCookieHeaders } from '@/lib/proxy-utils';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const res = await fetch(`${getBackendUrl()}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await res.json().catch(() => ({}));
        const response = NextResponse.json(data, { status: res.status });
        forwardSetCookieHeaders(res, response);
        return response;
    } catch (error) {
        console.error('Registration proxy error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
